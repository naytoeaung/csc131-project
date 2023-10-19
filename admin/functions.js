// UNFINISHED — will be used for functions in the future. Will not work yet

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');

const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");

const { Parser } = require('./fill.js');
const { generateExec, generateCloud } = require('./generate.js');

const app = initializeApp({
    credential: applicationDefault(),
    storageBucket: 'csc-131-a8d6a.appspot.com'
});
const db = getFirestore();
const storage = getStorage();

exports.run = async function (documentId, data) {
    if (data == null) {
        const localMode = true;
        data = await db.collection('data').doc(documentId).get();
    } else {
        const localMode = false;
    }

    // get template
    const template = (await storage.bucket().file(data['template']).download()).toString();

    // fill template (see fill.js)
    const parser = new Parser(template, data);
    const latex = parser.parse();

    // convert to pdf (see generate.js)
    // upload pdf
}
exports.oncreate = onDocumentCreated("data/{documentId}", (event) => {
    const documentId = event.params.documentId;
    const data = event.data.data().original;
    return run(documentId, data);
});
