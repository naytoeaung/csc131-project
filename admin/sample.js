/**
 * Creates randomized sample firestore data for testing
 * @module sample
 */

const itemOptions = ['Pencils', 'Pens', 'Calculators', 'Erasers', 'Markers', 'Highlighters', 'Sharpies', 'Tables', 'Furniture', 'Computers', 'Chairs', 'An article of furniture consisting of a flat slablike top supported on one or more legs or other supports'];

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
        let quantity = Math.floor(Math.random() * 20) + 1;
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
        run: true,
        generated: false,
        template: 'invoice',
        items: items,
        invoicex: Math.floor(Math.random() * 10000),
        total: total
    };
}
/**
 * Sample data for invoice2 template (with csv data)
 * @returns {object} data to be put in firestore
 */
function sampleDocument2(email=true) {
    let items = []
    let total = 0;
    for (let i = 0; i < 100; i++) {
        let name = itemOptions[Math.floor(Math.random() * itemOptions.length)];
        let quantity = Math.floor(Math.random() * 20) + 1;
        let uprice = (Math.floor(Math.random() * 200) / 100)
        let amount = (quantity * uprice);
        total += amount;
        items.push({
            "Product": name,
            "Quantity": quantity,
            "Uprice": uprice.toFixed(2),
            "Price": amount.toFixed(2),
        });
    }

    let result = {
        template: "invoice2",
        run: true,
        invoicex: Math.floor(Math.random() * 10000),
        refname: Math.floor(Math.random() * 10000),
        csv: {
            "sampletxt.csv": items
        }
    }
    if (email) {
        result.email = {
            subject: "Your Invoice",
            text: "Here is your invoice.",
            to: process.env.SAMPLE_EMAIL,
            attachmentName: "Invoice.pdf"
        }
    }
    return result
}

module.exports = { sampleDocument, sampleDocument2 };