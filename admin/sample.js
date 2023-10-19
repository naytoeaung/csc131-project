/**
 * Creates randomized sample firestore data for testing
 * @module sample
 */

const itemOptions = ['Pencils', 'Pens', 'Calculators', 'Erasers', 'Markers', 'Highlighters', 'Sharpies'];

/**
 * Generates random sample data for the invoice template
 * @param {int} numItems - optional, number of items to include in table
 * @returns {object} data to be put in firestore
 */
function sampleDocument(numItems=null) {
    if (numItems == null) {
        numItems = 4 + Math.floor(Math.random() * 5);
    }
    let items = []
    let total = 0;
    for (let i = 0; i < numItems; i++) {
        let name = itemOptions[Math.floor(Math.random() * itemOptions.length)];
        let quantity = Math.floor(Math.random() * 20);
        let uprice = Math.floor(Math.random() * 200) / 100;
        let amount = quantity * uprice;
        total += amount;
        items.push({
            name: name,
            quantity: quantity,
            uprice: uprice,
            amount: amount,
        });
    }
    return {
        generated: false,
        template: 'invoice',
        items: items,
        invoicex: Math.floor(Math.random() * 10000),
        total: total
    };
}
module.exports = { sampleDocument };