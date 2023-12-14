// functions imports
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

// firebase setup
const {db, storage} = require('./setup.js').getFirebase();

const {sampleInvoice} = require("./sample.js");
const {Document} = require("./document.js");

/**
 * When functions detects a new or updated document, it calls this function to check if
 * it needs processing and to initiate processing if so.
 * @param {*} documentId The id of the document
 * @param {*} data The data contained at the time of the function call
 */
async function updateDocument(documentId, data) {
    if (data.run) {
        logger.log(`Detected change to document ${documentId} (beginning process)`);
        const doc = new Document(documentId, {data: data, logger: logger.log});
        doc.process();
    } else {
        logger.log(`Detected change to document ${documentId} (no update needed)`);
    }
}

/**
 * Checks all old documents to see if there are any that were missed by functions
 * e.g. because functions were down when the document was added
 * Runs all documents that still have the run field set to true
 */
async function updateAll() {
    const query = db.collection('data').where('run', '==', true);
    const result = await query.get();
    for (i in result.docs) {
        const id = result.docs[i].id
        logger.log(`Found existing document that needs to run: ${id}`);
        // const doc = new Document(id, {logger: logger.log});
        // doc.process();
    }
}

/**
 * Adds a random sample document for testing
 */
exports.addSample = onRequest(async (req, res) => {
    const document = sampleInvoice();
    const result = await db.collection('data').add(document);
    logger.log(`Added Sample Document - ID: ${result.id}`);
    res.json({id: result.id, document: document});
});

/**
 * Adds a document specified in the request body
 */
exports.addDocument = onRequest(async (req, res) => {
    const document = req.body;
    const result = await db.collection('data').add(document);
    logger.log(`Added New Document - ID: ${result.id}`);
    res.json({id: result.id, document: document});
});

/**
 * Runs when cloud functions detects a new document has been added
 */
exports.onCreate = onDocumentCreated("data/{documentId}", async (event) => {
    const document = event.params.documentId;
    const data = event.data.data();
    await updateDocument(document, data);
    await updateAll(); // check old documents to see if they need updating too
});

/**
 * Runs when cloud functions detects a document has been updated
 */
exports.onUpdate = onDocumentUpdated("data/{documentId}", async (event) => {
    const document = event.params.documentId;
    const data = event.data.after.data();
    await updateDocument(document, data);
    await updateAll(); // check old documents to see if they need updating too
});