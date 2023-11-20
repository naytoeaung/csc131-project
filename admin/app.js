require('dotenv').config();

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const fs = require('fs')

const { sampleDocument, sampleDocument2 } = require('./sample.js');
const { Parser } = require('./fill.js');
const { setUp, generateExec, generateCloud, cleanUp } = require('./generate.js');
const { sendEmail } = require('./email.js');
const { handleCSV } = require('./csv.js');


initializeApp({
    storageBucket: process.env.STORAGE_BUCKET
});
const db = getFirestore();
const storage = getStorage();

/**
 * The main program. Starts when you run the program
 */
async function main() {
    const document = sampleDocument2()
    const result = await db.collection('data').add(document)
    const documentID = result.id;
    console.log(`added document ${documentID} with invoice number ${document.invoicex}`)

    run(documentID);
    // after this runs, check cloud storage to see the pdf
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

    // get csv data from firestore
    if (data.csv)
        await handleCSV(data.csv);

    // 3. fill in template
    const parser = new Parser(template, data);
    const newLatex = parser.parse();

    // 4. convert to pdf
    const result = generateExec(newLatex);

    // 5. upload pdf to storage
    const resultPath = `documents/${document}.pdf`;
    await uploadFile(result, resultPath);

    // 6. update firestore with generation info
    const log = fs.readFileSync('tmp/result.log', 'utf-8');
    const url = await getDownloadURL(storage.bucket().file(resultPath));
    await doc.update({
        run: false,
        generated: true,
        url: url,
        log: log
    });

    // to do: error detection

    // 7. send email
    if (data.email) {
        const file = storage.bucket().file(resultPath);
        const [buffer] = await file.download();
        await sendEmail(buffer, data.email);
    }

    // remove temporary files
    cleanUp();
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
    await storage.bucket().upload(path, {destination: output});
}

main();