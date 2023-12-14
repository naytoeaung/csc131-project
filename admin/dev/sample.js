/**
 * Creates randomized sample firestore data for testing
 * @module sample
 */

const itemOptions = [
    'Pencils', 'Pens', 'Calculators', 'Erasers', 'Markers', 'Highlighters',
    'Sharpies', 'Tables', 'Furniture', 'Computers', 'Chairs',
    'An article of furniture consisting of a flat slablike top supported on one or more legs or other supports'
];

function rand(min, max, precision=1) {
    let start = min / precision
    let range = (max - min) / precision
    return Math.floor(Math.random() * (range + 1) + start) * precision
}

/**
 * Sample data for invoice2 template (with csv data)
 * @returns {object} data to be put in firestore
 */
function sampleInvoice(email=true) {
    let items = []
    let total = 0;
    for (let i = 0; i < 100; i++) {
        let name = itemOptions[Math.floor(Math.random() * itemOptions.length)];
        let quantity = rand(1, 20);
        let uprice = rand(0.25, 5.00, 0.01);
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
        invoicex: rand(1000, 9999),
        refname: "Zurg 2.0",
        csv: {
            "sampletxt.csv": items
        }
    }
    if (email) {
        result.email = {
            subject: "Your Invoice",
            template: "invoice",
            to: process.env.SAMPLE_EMAIL,
            attachmentName: "Invoice.pdf"
        }
    }
    return result
}

module.exports = { sampleInvoice };