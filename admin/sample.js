// creates randomized sample firestore data for testing

function sampleDocument() {
    let items = []
    let total = 0;
    for (let i = 0; i < 5; i++) {
        let quantity = Math.floor(Math.random() * 20);
        let uprice = Math.floor(Math.random() * 200) / 100;
        let amount = quantity * uprice;
        total += amount;
        items.push({
            name: 'item' + (i + 1),
            quantity: quantity,
            uprice: uprice,
            amount: amount,
        });
    }
    return {
        generated: false,
        template: 'invoice.tex',
        items: items,
        invoicex: Math.floor(Math.random() * 10000),
        total: total
    };
}
module.exports = { sampleDocument };