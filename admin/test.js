// for testing

const { Parser } = require('./fill.js');
const { generateExec, cleanUp } = require('./generate.js')
const { sampleDocument } = require('./sample.js');
const fs = require('fs');

function run() {
    const data = sampleDocument(100);
    const template = fs.readFileSync('invoice.tex', 'utf-8');
    const latex = (new Parser(template, data)).parse();
    const pdfPath = generateExec(latex);
    console.log(pdfPath);
    // cleanUp();
}

run();