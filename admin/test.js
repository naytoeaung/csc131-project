// for testing

const { Parser } = require('./fill.js');
const { generateExec, cleanUp } = require('./generate.js')
const { sampleDocument } = require('./sample.js');
const fs = require('fs');
const { createCSV } = require('./csv.js');

function parserTest() {
    const data = sampleDocument(100);
    const template = fs.readFileSync('invoice.tex', 'utf-8');
    const latex = (new Parser(template, data)).parse();
    const pdfPath = generateExec(latex);
    console.log(pdfPath);
    // cleanUp();
}
function csvTest() {
    const data = sampleDocument(100);
    const csv = createCSV(data.items);
    console.log(csv);
}

csvTest();