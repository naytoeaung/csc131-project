const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const { execSync } = require('child_process');
const fs = require('fs')

async function run() {
    const app = initializeApp({
        credential: applicationDefault(),
        storageBucket: 'csc-131-a8d6a.appspot.com'
    });
    const db = getFirestore();
    const storage = getStorage();

    // put the firestore document id here
    const documentID = 'test';
    // make sure the firestore document includes a field "template"
    // which includes the name of a .tex file stored in the bucket

    fill(db, storage, documentID);
    // after this runs, check cloud storage to see the pdf
}

async function downloadFile(storage, path, output) {
    await storage.bucket().file(path).download({destination: output});
}

async function uploadFile(storage, path, output) {
    await storage.bucket().upload(path, {destination: output})
}

function fillInData(latex, data) {
    const parts = latex.split("@");
    let result = "";
    let keyMode = false;
    for (let i in parts) {
        let part = parts[i];
        if (keyMode) {
            const directions = part.split('.');
            part = data
            for (let j in directions) {
                let direction = directions[j];
                part = part[direction]
            }
        }
        result += part
        keyMode = !keyMode
    }
    return result
}

async function fill(db, storage, document) {
    // 1. get fill in data from firestore
    const doc = db.collection('data').doc(document);
    const snapshot = await doc.get();
    const data = snapshot.data();

    // 2. download template from storage
    const templatePath = data['template'];
    await downloadFile(storage, templatePath, 'template.tex');
    const template = fs.readFileSync('template.tex', 'utf8');

    // 3. fill in template
    const newLatex = fillInData(template, data);
    fs.writeFileSync("result.tex", newLatex);

    // 4. convert to pdf
    execSync('pdflatex result.tex', logError);

    // 5. upload pdf to storage
    const resultPath = `${document}.pdf`;
    await uploadFile(storage, 'result.pdf', resultPath);

    // 6. update firestore with generation info
    const url = await getDownloadURL(storage.bucket().file(resultPath));
    await doc.update({
        generated: true,
        url: url
    });
    // to do: error detection

    // 7. send email
    // unfinished

    // 8. delete unused local files
    // unfinished
}

function logError(error) {
    if (error) console.log(error);
}

run();