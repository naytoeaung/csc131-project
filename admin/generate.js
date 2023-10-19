/**
 * Converts LaTeX code to PDF documents
 * @module generate
 */

const fs = require('fs');
const { execSync } = require('child_process');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
        execSync('pdflatex result.tex', {cwd: 'tmp', timeout: 1000});
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
 * @returns {string} the file path to the resulting PDF
 */
async function generateCloud(latex) {
    setUp();

    const url = 'https://api.advicement.io/v1/templates/pub-tex-to-pdf-with-pdflatex-v1/compile';
    const body = {
        texFileContent: latex
    };
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
    const pdfUrl = data['documentStatusUrl'];
    console.log(data);
    return 'tmp/result.pdf'
}

/**
 * Removes all temporary files from generation
 */
function cleanUp() {
    if (fs.existsSync('tmp'))
        fs.rmSync('tmp', {recursive: true});
}

module.exports = { setUp, generateExec, generateCloud, cleanUp };