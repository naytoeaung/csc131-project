const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const { execSync } = require('child_process');
const fs = require('fs')

const { sampleDocument } = require('./sample.js');
const { Parser } = require('./fill.js');

async function main() {
    // to authorize: go to firebase settings > service accounts
    // and download a new private key, then set
    // the environment variable GOOGLE_APPLICATION_CREDENTIALS
    // to the path to the downloaded file
    const app = initializeApp({
        credential: applicationDefault(),
        storageBucket: 'csc-131-a8d6a.appspot.com'
    });
    const db = getFirestore();
    const storage = getStorage();

    const documentID = 'test'; // put the firestore document id here
    const doc = db.collection('data').doc(documentID);
    await doc.set(sampleDocument());

    run(db, storage, documentID);
    // after this runs, check cloud storage to see the pdf
}

async function downloadFile(storage, path, output) {
    await storage.bucket().file(path).download({destination: output});
}

async function uploadFile(storage, path, output) {
    await storage.bucket().upload(path, {destination: output})
}

async function run(db, storage, document) {
    // create directory for temporary files
    if (!fs.existsSync('process'))
        fs.mkdirSync('process');

    // 1. get fill in data from firestore
    const doc = db.collection('data').doc(document);
    const snapshot = await doc.get();
    const data = snapshot.data();

    // 2. download template from storage
    const templatePath = data['template'];
    await downloadFile(storage, templatePath, 'process/template.tex');
    await downloadFile(storage, 'ansync.jpg', 'process/ansync.jpg');
    const template = fs.readFileSync('process/template.tex', 'utf8');

    // 3. fill in template
    const parser = new Parser(template, data);
    const newLatex = parser.parse();
    fs.writeFileSync("process/result.tex", newLatex);

    // 4. convert to pdf
    try {
        execSync('pdflatex result.tex', {cwd: 'process', timeout: 1000});
    } catch (error) {
        console.log(error.stdout.toString());
    }

    // 5. upload pdf to storage
    const resultPath = `${document}.pdf`;
    await uploadFile(storage, 'process/result.pdf', resultPath);

    // 6. update firestore with generation info
    const url = await getDownloadURL(storage.bucket().file(resultPath));
    await doc.update({
        generated: true,
        url: url
    });
    // to do: error detection

    // 7. send email
    // unfinished

    // delete unused local files
    fs.rmSync('process', {recursive: true});
}

main();