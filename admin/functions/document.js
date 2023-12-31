/**
 * Runs all steps of the process of generating a PDF and sending an email
 * @module document
 */

const { db, storage } = require('./setup.js').getFirebase();
const { getDownloadURL } = require('firebase-admin/storage');
const fs = require('fs')

const { Parser } = require('./fill.js');
const { setUp, generateExec, generateCloud, cleanUp } = require('./generate.js');
const { sendEmail } = require('./email.js');
const { handleCSV } = require('./csv.js');

/**
 * Class for handling processing a firestore document
 */
class Document {
    /**
     * Create a new document to initiate processing a firestore document
     * @param {string} documentId - id of firestore document to process
     * @param {Object} options
     * @param {*} options.data - provide firestore data if already known from functions
     * @param {function} options.logger - console.log by default, can set to cloud functions logger
     * @param {boolean} options.cloud - true: use DynamicDocs, false: use pdfLatex CLI
     */
    constructor(documentId, {data, logger, cloud} = {}) {
        this.id = documentId;
        this.doc = db.collection('data').doc(documentId);
        this.data = data;
        this.logger = logger || console.log;
        this.log = "";
        this.cloud = (cloud === undefined) ? true : cloud;
    }

    /**
     * Save a message to the log
     * @param {string} message - the message to add to the log
     */
    logMessage(message) {
        this.log += message + '\n';
        this.logger(message);
    }

    /** 
     * Run the entire process of filling in a template, generating a pdf, and sending an email, and log errors
    */
    async process() {
        try {
            await this.run();
        } catch (error) {
            this.log += `ERROR: ${error.name}\n${error.message}\n`
            this.logger(error);
            await this.doc.update({
                run: false,
                "status.log": this.log
            });
        }
    }

    /**
     * Run the entire process of filling in a template, generating a pdf, and sending an email, without handling errors
     */
    async run() {
        this.logMessage(`Starting processing of document ${this.id}`)

        // DOWNLOAD DATA FROM FIRESTORE
        if (!this.data) {
            this.logMessage(`Downloading data from Firestore`);
            const snapshot = await this.doc.get();
            this.data = snapshot.data();
        }

        // PREPARE STATUS INFORMATION
        this.logMessage(`Setting up status information in Firestore`);
        await this.doc.update({
            run: false,
            status: {
                generated: false,
                emailed: false
            }
        });

        // DOWNLOAD TEMPLATE
        this.logMessage(`Downloading template ${this.data['template']}`);
        setUp();
        const templatePath = 'templates/' + this.data['template'];
        await downloadFolder(templatePath, 'tmp');
        let template = fs.readFileSync('tmp/template.tex', 'utf8');

        // HANDLE CSV DATA
        if (this.data.csv) {
            this.logMessage("Downloading CSV files: " + Object.keys(this.data.csv).join(', '));
            await handleCSV(this.data.csv);
        }

        // FILL IN TEMPLATE
        this.logMessage("Filling in LaTeX template with Firestore data");
        const parser = new Parser(template, this.data);
        let newLatex = parser.parse();

        // CONVERT TO PDF
        this.logMessage("Converting LaTeX to PDF");
        let resultPath;
        let pdfLatexLog;
        if (this.cloud) {
            resultPath = await generateCloud(newLatex);
            pdfLatexLog = "DYNAMICDOCS LOG:\n" + fs.readFileSync('tmp/dynamicdocs.log', 'utf8');
            pdfLatexLog += "PDFLATEX LOG:\n" + fs.readFileSync('tmp/result.log');
        } else {
            resultPath = generateExec(newLatex);
            pdfLatexLog = fs.readFileSync('tmp/result.log', 'utf8');
        }

        // UPLOAD PDF TO STORAGE
        this.logMessage("Uploading PDF to Cloud Storage");
        const storagePath = `documents/${this.id}.pdf`;
        await storage.bucket().upload(resultPath, {destination: storagePath});
        const url = await getDownloadURL(storage.bucket().file(storagePath));

        // UPDATE FIRESTORE WITH GENERATION INFO
        this.logMessage("Updating Firestore with generation information");
        await this.doc.update({
            "status.generated": true,
            "status.url": url,
            "status.pdfLatexLog": pdfLatexLog
        });

        // UPDATE DATA
        // so that the email can include status information
        const snapshot = await this.doc.get();
        this.data = snapshot.data();

        // SEND EMAIL
        if (this.data.email) {
            this.logMessage("Sending Email via SendGrid");
            const file = storage.bucket().file(storagePath);
            const [buffer] = await file.download();
            let emailData;
            if (this.data.email.template) {
                this.logMessage(`Downloading Email Template ${this.data.email.template}`);
                const emailTemplatePath = 'emailTemplates/' + this.data.email.template;
                await downloadFolder(emailTemplatePath, 'tmp');
                const emailTemplate = fs.readFileSync('tmp/template.html', 'utf8');
                const emailParser = new Parser(emailTemplate, this.data);
                emailData = {html: emailParser.parse(), ...this.data.email};
            } else {
                emailData = this.data.email;
            }
            await sendEmail(buffer, emailData);
            await this.doc.update({
                "status.emailed": true
            });
        }

        // REMOVE TEMPORARY FILES
        this.logMessage("Cleaning up temporary files");
        cleanUp();

        this.logMessage("Process successfully finished");
        await this.doc.update({
            "status.log": this.log
        });
    }
}

/**
 * Downloads all files from a folder in cloud storage to local storage
 * @param {*} path - the folder in cloud storage to download
 * @param {*} output - the location in local storage to save to
 */
async function downloadFolder(path, output) {
    const [files] = await storage.bucket().getFiles({ prefix: path + '/', autoPaginate: false });
    await Promise.all(files.map(async (file) => {
        let trimmedPath = file.name.split('/').at(-1);
        if (trimmedPath == '') return;
        await file.download({destination: output + '/' + trimmedPath});
    }));
}

module.exports = { Document };