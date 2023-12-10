require('dotenv').config();

// functions imports
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

// firebase setup
const {db, storage} = require('../src/setup.js').getFirebase();

const {sampleInvoice} = require("../dev/sample.js");
const {Processor} = require("../src/document.js");

async function newOnUpdate(documentId, data) {
    if (data.run) {
        logger.log(`Detected change to document ${documentId} (beginning process)`);
        const processor = new Processor(documentId, {data: data, logger: logger.log, cloud: false});
        processor.process();
    } else {
        logger.log(`Detected change to document ${documentId} (no update needed)`);
    }
}

exports.addsample = onRequest(async (req, res) => {
    const document = sampleInvoice();
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