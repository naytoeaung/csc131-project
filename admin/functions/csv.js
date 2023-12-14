const fs = require('fs');
const csvParse = (...args) => import('d3-dsv').then((d3) => d3.csvParse(...args));
const csvFormat = (...args) => import('d3-dsv').then((d3) => d3.csvFormat(...args));

/**
 * Takes a map of csv data such as:
 * {
 *   table1.csv: [...],
 *   table2.csv: [...]
 * }
 * and downloads them all as csv files to the temporary directory
 * @param {Object} data - The data to convert into CSV files
 */
async function handleCSV(data) {
    for (let path in data) {
        const content = data[path];
        let csv;
        if (typeof content === 'string') {
            csv = content;
        } else {
            csv = await csvFormat(content);
        }
        fs.writeFileSync(`tmp/${path}`, csv);
    }
}

/**
 * Converts csv data back to an array of maps
 * @param {str} csv
 * @returns {Promise<object[]>}
 */
async function readCSV(csv) {
    return await csvParse(csv);
}

module.exports = { handleCSV, readCSV };