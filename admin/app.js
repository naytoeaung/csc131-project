require('dotenv').config();
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const fs = require('fs')

const { sampleDocument } = require('./sample.js');
const { Parser } = require('./fill.js');
const { setUp, generateExec, cleanUp } = require('./generate.js');

initializeApp({
    storageBucket: process.env.STORAGE_BUCKET
});
const db = getFirestore();
const storage = getStorage();

/**
 * The main program. Starts when you run the program
 */
async function main() {
    const documentID = 'test'; // put the firestore document id here
    const doc = db.collection('data').doc(documentID);
    await doc.set(sampleDocument());

    run(documentID);
    // after this runs, check cloud storage to see the pdf
}

/**
 * Downloads a file from cloud storage to local storage
 * @param {*} path - the location in cloud storage to download
 * @param {*} output - the location in local storage to save to
 */
async function downloadFile(path, output) {
    await storage.bucket().file(path).download({destination: output});
}

/**
 * Downloads all files from a folder in cloud storage to local storage
 * @param {*} path - the folder in cloud storage to download
 * @param {*} output - the location in local storage to save to
 */
async function downloadFolder(path, output) {
    const files = await storage.bucket().getFiles({ prefix: path + '/', autoPaginate: false });
    await Promise.all(files[0].map(async (file) => {
        let trimmedPath = file.name.split('/').at(-1);
        if (trimmedPath == '') return;
        await file.download({destination: output + '/' + trimmedPath});
    }));
}

/**
 * Uploads a file from local storage to cloud storage
 * @param {} path - the file to upload to the cloud
 * @param {*} output - the location in cloud storage to save to
 */
async function uploadFile(path, output) {
    await storage.bucket().upload(path, {destination: output})
}

/**
 * Runs through all steps of filling template and generating pdf
 * @param {string} document - id of document in firestore to generate from
 */
async function run(document) {
    // 1. get fill in data from firestore
    const doc = db.collection('data').doc(document);
    const snapshot = await doc.get();
    const data = snapshot.data();

    // 2. download template from storage
    setUp();
    const templatePath = 'templates/' + data['template'];
    await downloadFolder(templatePath, 'tmp');
    const template = fs.readFileSync('tmp/template.tex', 'utf8');

    // 3. fill in template
    const parser = new Parser(template, data);
    const newLatex = parser.parse();

    // 4. convert to pdf
    const result = generateExec(newLatex);

    // 5. upload pdf to storage
    const resultPath = `documents/${document}.pdf`;
    await uploadFile(result, resultPath);

    // 6. update firestore with generation info
    const url = await getDownloadURL(storage.bucket().file(resultPath));
    await doc.update({
        generated: true,
        url: url
    });
    // to do: error detection

    // 7. send email
    // unfinished

    cleanUp();
}

main();