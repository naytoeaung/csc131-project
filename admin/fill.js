// used to fill latex templates with data

function fillLatex(latex, data) {
    const parts = latex.split('@');
    let codeMode = false;
    let result = "";
    for (let i in parts) {
        let part = parts[i];
        if (codeMode) {
            result += interpret(part, data);
        } else {
            result += part;
        }
        codeMode = !codeMode;
    }
    return result;
}

function interpret(code, data) {
    // e.g. invoiceNum -> data["invoiceNum"]
    const path = code.split('.');
    let result = data;
    for (let i in path) {
        result = result[path[i]];
        // goes down a specified path
        // e.g. items.0.price -> data["items"][0]["price"]
    }
    return result;
}

module.exports = { fillLatex };