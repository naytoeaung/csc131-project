const fs = require('fs');

/**
 * Takes a map of csv data such as:
 * {
 *   table1.csv: [...],
 *   table2.csv: [...]
 * }
 * and downloads them all as csv files to the temporary directory
 * @param {Object} data - The data to convert into CSV files
 */
function handleCSV(data) {
    for (let path in data) {
        const content = data[path];
        let csv;
        if (typeof content === 'string') {
            csv = content;
        } else {
            csv = createCSV(content);
        }
        fs.writeFileSync(`tmp/${path}`, csv);
    }
}


/**
 * Converts an array of maps to a csv file
 * @param {Object[]} arr - array to convert to CSV
 * @returns {String} resulting CSV data
 */
function createCSV(arr, resultPath) {
    let headers = [];
    for (let i in arr) {
        for (let key in arr[i]) {
            if (!headers.includes(key))
                headers.push(key)
        }
    }
    let rows = [];
    rows.push(headers.join(', '));
    for (let i in arr) {
        let row = [];
        let map = arr[i];
        for (let h in headers) {
            let item;
            if (Object.hasOwn(map, headers[h])) {
                item = map[headers[h]];
            } else {
                item = '';
            }
            row.push(item);
        }
        rows.push(row.join(', '));
    }
    return rows.join('\n');
}

module.exports = { handleCSV, createCSV };