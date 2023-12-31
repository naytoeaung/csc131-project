/**
 * Used for testing locally using "node dev/app.js". Adds a new random document and runs
 */

const { db, storage } = require('./setup.js').getFirebase();
const { sampleInvoice } = require('./sample.js');
const { Document } = require('./document.js');

async function main() {
    const document = sampleInvoice("invoiceCustom")
    const result = await db.collection('data').add(document)
    const documentID = result.id;
    console.log(`added document ${documentID} with invoice number ${document.invoicex}`)

    // await (new Document(documentID, {cloud: false})).process();
}

main();