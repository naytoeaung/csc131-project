// // // UNFINISHED — will be used for functions in the future. Will not work yet

// // const { initializeApp, applicationDefault } = require('firebase-admin/app');
// // const { getFirestore } = require('firebase-admin/firestore');
// // const { getStorage, getDownloadURL } = require('firebase-admin/storage');

// // const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");

// // const { Parser } = require('./fill.js');
// // const { generateExec, generateCloud } = require('./generate.js');

// // const app = initializeApp({
// //     credential: applicationDefault(),
// //     storageBucket: 'csc-131-a8d6a.appspot.com'
// // });
// // const db = getFirestore();
// // const storage = getStorage();

// // exports.run = async function (documentId, data) {
// //     if (data == null) {
// //         const localMode = true;
// //         data = await db.collection('data').doc(documentId).get();
// //     } else {
// //         const localMode = false;
// //     }

// //     // get template
// //     const template = (await storage.bucket().file(data['template']).download()).toString();

// //     // fill template (see fill.js)
// //     const parser = new Parser(template, data);
// //     const latex = parser.parse();

// //     // convert to pdf (see generate.js)
// //     // upload pdf
// // }
// // exports.oncreate = onDocumentCreated("data/{documentId}", (event) => {
// //     const documentId = event.params.documentId;
// //     const data = event.data.data().original;
// //     return run(documentId, data);
// // });
// /**
//  * Import function triggers from their respective submodules:
//  *
//  * const {onCall} = require("firebase-functions/v2/https");
//  * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// const {onRequest} = require("firebase-functions/v2/https");

// const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");

// const logger = require("firebase-functions/logger");


// const {initializeApp} = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");
// const {getStorage} = require("firebase-admin/storage")

// const app = initializeApp({
//     storageBucket: 'csc-131-a8d6a.appspot.com'
// });
// const db = getFirestore();
// const storage = getStorage();


// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// // exports.helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });

// async function onUpdate(document, data) {
//     logger.log("running in functions.js");
//     if (data.run) {
//         logger.log("updating " + document);
//         await db.collection('data').doc(document).update({run: false});
//     } else {
//         logger.log("detected change to " + document + ", no run needed");
//     }
// }

// exports.oncreate = onDocumentCreated("data/{documentId}", async (event) => {
//     const document = event.params.documentId;
//     const data = event.data.data()
//     await onUpdate(document, data)
// });

// exports.onupdate = onDocumentUpdated("data/{documentId}", async (event) => {
//     const document = event.params.documentId;
//     const data = event.data.after.data()
//     await onUpdate(document, data)
// });
