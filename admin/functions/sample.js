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
 * Sample data for invoiceSimple template
 * @returns {object} data to be put in firestore
 */
function sampleInvoice(template, email=true) {
    let items = []
    let total = 0;
    for (let i = 0; i < 100; i++) {
        let name = itemOptions[Math.floor(Math.random() * itemOptions.length)];
        let quantity = rand(1, 20);
        let uprice = rand(0.25, 5.00, 0.01);
        let amount = (quantity * uprice);
        total += amount;
        let item = {
            "product": name,
            "quantity": quantity,
            "uprice": uprice.toFixed(2),
            "tax": Math.random() < 0.2 ? "Tax Exempt" : "7.25\\%",
            "price": amount.toFixed(2),
        };
        items.push(item);
    }

    let result = {
        template: template,
        run: true,
        invoicex: rand(1000, 9999),
        refname: "Zurg 2.0",
        subtotal: total.toFixed(2),
        taxtotal: (total * 0.0725).toFixed(2),
        total: (total * 1.0725).toFixed(2),
        customer: "Evil, inc.",
        duedate: "January 1, 2024",
        csv: {
            "data.csv": items
        }
    }
    if (template === "invoiceCustom") {
        result.label = ["product", "quantity", "uprice", "tax", "price"];
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