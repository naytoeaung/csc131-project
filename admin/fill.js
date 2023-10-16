// used to fill latex templates with data

class Parser {
    constructor(latex, data) {
        this.latex = latex;
        this.data = data;
        this.funcs = {
            dollar: dollar,
            for: startFor,
            endfor: endFor
        }
    }

    parse() {
        // runs through latex document, looking for @ symbols to replace
        let result = '';
        this.i = 0;
        while (this.i < this.latex.length) {
            let char = this.latex[this.i];
            this.i++;
            if (char == '@')
                result += this.interpret(); // when it finds @, interpret from that point
            else
                result += char;
        }
        return result;
    }

    interpret() {
        // interprets starting from an @ symbol
        let token = '';
        while ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.'.includes(this.latex[this.i])) {
            token += this.latex[this.i];
            this.i++;
        }
        if (token.length == 0) return null;

        if (this.latex[this.i] == '(') {
            //function e.g. dollar()
            this.i++; // pass (
            let arg = this.interpret(); // interpret between parentheses
            this.i++; // pass )
            return this.funcs[token](this, arg);
        } else {
            //data e.g. items.0.price
            return this.getData(token);
        }
    }

    getData(token) {
        // looks up path (e.g. items.0.price) in data map
        const path = token.split('.');
        let result = this.data;
        for (let i in path)
            result = result[path[i]];
        return result;
    }
}

function dollar(parser, num) {
    // formats a number as dollars
    return '\\$' + num.toFixed(2);
}

function startFor(parser, list) {
    parser.forList = list;
    parser.forIndex = 0;
    parser.forStart = parser.i;
    parser.data['item'] = parser.forList[parser.forIndex];
    return '';
}

function endFor(parser, _) {
    parser.forIndex++;
    if (parser.forIndex >= parser.forList.length) return '';
    parser.i = parser.forStart;
    parser.data['item'] = parser.forList[parser.forIndex];
    return '';
}

// old
// function fillLatex(latex, data) {
//     const parts = latex.split('@');
//     let codeMode = false;
//     let result = "";
//     for (let i in parts) {
//         let part = parts[i];
//         if (codeMode) {
//             result += interpret(part, data);
//         } else {
//             result += part;
//         }
//         codeMode = !codeMode;
//     }
//     return result;
// }

// // old
// function interpret(code, data) {
//     // e.g. invoiceNum -> data["invoiceNum"]
//     const path = code.split('.');
//     let result = data;
//     for (let i in path) {
//         result = result[path[i]];
//         // goes down a specified path
//         // e.g. items.0.price -> data["items"][0]["price"]
//     }
//     return result;
// }

module.exports = { Parser };