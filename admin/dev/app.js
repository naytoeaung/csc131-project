require('dotenv').config();

const { db, storage } = require('../src/setup.js').getFirebase();

const { sampleInvoice } = require('./sample.js');
const { Processor } = require('../src/document.js');


/**
 * The main program. Starts when you run the program
 */
async function main() {
    const document = sampleInvoice()
    const result = await db.collection('data').add(document)
    const documentID = result.id;
    console.log(`added document ${documentID} with invoice number ${document.invoicex}`)

    await (new Processor(documentID, {cloud: false})).process();
}

main();