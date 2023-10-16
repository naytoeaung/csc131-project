const { Parser } = require('./fill.js');
const { sampleDocument } = require('./sample.js');
const fs = require('fs');

function run() {
    const data = sampleDocument();
    const template = fs.readFileSync('invoice.tex', 'utf-8');
    const result = (new Parser(template, data)).parse();
    console.log(result);
}

run();