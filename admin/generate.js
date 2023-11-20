/**
 * Converts LaTeX code to PDF documents
 * @module generate
 */

const fs = require('fs');
const { execSync } = require('child_process');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const { readCSV } = require('./csv.js');
const { setTimeout } = require('timers/promises');

/**
 * Creates temporary directory for working
 */
function setUp() {
    if (!fs.existsSync('tmp')) fs.mkdirSync('tmp')
}

/**
 * Converts LaTeX code to a PDF using the command line
 * Requires pdflatex command to be installed (which does not work in functions)
 * @param {string} latex - the LaTeX to convert to PDF
 * @returns {string} the file path to the resulting PDF
 */
function generateExec(latex) {
    setUp();
    fs.writeFileSync('tmp/result.tex', latex);

    try {
        execSync('pdflatex result.tex', {cwd: 'tmp', timeout: 10000});
    } catch (error) {
        console.log(error);
        if (error.stdout) console.log(error.stdout.toString());
    }
    return 'tmp/result.pdf';
}

/**
 * Converts LaTeX code to a PDF using DynamicDocs
 * UNFINISHED - does not work yet
 * @param {string} latex - the LaTeX to convert to PDF
 * @returns {Promise<string>} the file path to the resulting PDF
 */
async function generateCloud(latex) {
    setUp();

    const url = 'https://api.advicement.io/v1/templates/pub-tex-to-pdf-with-pdflatex-v1/compile';
    const body = await dynamicDocsBody(latex);
    console.log(body);
    const headers = {
        'Adv-Security-Token': process.env.DYNAMIC_DOCS_TOKEN,
        'Content-Type': 'application/json'
    };
    const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    const statusUrl = data['documentStatusUrl'];

    let statusResponse = await fetch(statusUrl);
    let statusData = await statusResponse.json();
    console.log(statusData);
    let i = 0;
    while (statusData['statusDescription'] === 'document processing' && i < 10) {
        await setTimeout(5000);
        statusResponse = await fetch(statusUrl);
        statusData = await statusResponse.json();
        console.log(statusData);
        i++;
    }
    const pdfUrl = statusData['documentUrl'];

    const pdfResponse = await fetch(pdfUrl);
    const writeStream = fs.createWriteStream('tmp/result.pdf');
    await streamPipeline(pdfResponse.body, writeStream);

    return 'tmp/result.pdf'
}

/**
 * Creates request body for DynamicDocs request
 * @param {string} latex 
 * @returns {object}
 */
async function dynamicDocsBody(latex) {
    // replaces images for dynamic docs to work
    let result = {};

    let splits = latex.split("\\includegraphics");
    latex = splits[0];
    for (let i in splits) {
        if (i == 0) continue;
        let section = splits[i];

        let details;
        if (section[0] === '[') {
            details = section.substring(1, section.indexOf(']'));
            // details = details.replace("height", "width");
        }
        const fileName = section.substring(section.indexOf('{') + 1, section.indexOf('}'));
        const [key, type] = fileName.split('.');
        let replacement = `\\advGetImage{key = ${key}, type=${type}`;
        if (details) replacement += `, ${details}`;
        replacement += `}`;
        latex += replacement + section.substring(section.indexOf('}') + 1);
        result[key] = fs.readFileSync(`tmp/${fileName}`, 'base64');
    }

    // replaces csv data for dynamic docs to work
    splits = latex.split("\\DTLloaddb");
    latex = splits[0];
    for (let i in splits) {
        if (i == 0) continue;
        let section = splits[i];

        let [dbName, fileName, ...rest] = section.split('}');
        rest = rest.join('}');
        dbName = dbName.substring(1);
        fileName = fileName.substring(1);

        let replacement = `\\DTLnewdb{${dbName}}`
        let data = await readCSV(fs.readFileSync(`tmp/${fileName}`, 'utf-8'));
        for (row of data) {
            replacement += `\n\\DTLnewrow{${dbName}}`
            for (property in row) {
                replacement += `\n\\DTLnewdbentry{${dbName}}{${property}}{${row[property]}}`
            }
        }
        latex += replacement + rest;
    }

    result['texFileContent'] = latex;
    console.log(latex);
    return result
}

/**
 * Removes all temporary files from generation
 */
function cleanUp() {
    if (fs.existsSync('tmp'))
        fs.rmSync('tmp', {recursive: true});
}

module.exports = { setUp, generateExec, generateCloud, cleanUp };