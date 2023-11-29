require('dotenv').config();

// functions imports
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

// firebase setup
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage, getDownloadURL} = require("firebase-admin/storage")

const app = initializeApp({
    storageBucket: 'csc-131-a8d6a.appspot.com'
});
const db = getFirestore();
const storage = getStorage();

const fs = require('fs')
const {Parser} = require("../fill.js");
const {setUp, generateExec, cleanUp} = require("../generate.js");
const {sampleDocument, sampleDocument2} = require("../sample.js");
const {initProcess, Processor} = require("../process.js");
initProcess(app);

async function newOnUpdate(documentId, data) {
    if (data.run) {
        logger.log(`Detected change to document ${documentId} (beginning process)`);
        const processor = new Processor(documentId, {data: data, logger: logger.log, cloud: false});
        processor.process();
    } else {
        logger.log(`Detected change to document ${documentId} (no update needed)`);
    }
}

async function onUpdate(document, data) {
    if (data.run) {
        logger.log("updating " + document);
        await db.collection('data').doc(document).update({run: false});
        
        // 2. download template from storage
        setUp();
        await downloadFolder(`templates/${data.template}`, 'tmp');
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
        let url;
        try {
            url = await getDownloadURL(storage.bucket().file(resultPath));
        } catch (error) {
            logger.log(error);
            url = `gs://${storage.bucket().name}.appspot.com/${resultPath}`;
        }

        cleanUp();

        await db.collection('data').doc(document).update({generated: true, url: url});
    } else {
        logger.log("detected change to " + document + ", no run needed");
    }
}

exports.addsample = onRequest(async (req, res) => {
    const document = sampleDocument2();
    const result = await db.collection('data').add(document);
    logger.log(`added document ID: ${result.id} invoiceNum: ${document.invoicex}`);
    res.json({result: `added document ID: ${result.id} invoiceNum: ${document.invoicex}`, document: document});
});

exports.oncreate = onDocumentCreated("data/{documentId}", async (event) => {
    const document = event.params.documentId;
    const data = event.data.data();
    await newOnUpdate(document, data);
});

exports.onupdate = onDocumentUpdated("data/{documentId}", async (event) => {
    const document = event.params.documentId;
    const data = event.data.after.data();
    await newOnUpdate(document, data);
});




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
    // logger.log(files[0]);
    await Promise.all(files[0].map(async (file) => {
        // logger.log(file.name);
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