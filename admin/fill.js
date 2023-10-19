/**
 * Fills in LaTeX template with data from firestore
 * @module fill
 */

/**
 * Class for parsing LaTex and replacing @ symbols
 */
class Parser {
    /**
     * Creates a 
     * @param {string} latex - latex template to fill in
     * @param {object} data - firestore data to fill in with
     */
    constructor(latex, data) {
        this.latex = latex;
        this.data = data;
        this.funcs = {
            dollar: dollar,
            for: startFor,
            endfor: endFor
        }
    }

    /**
     * Runs through the LaTeX code and finds @ symbols to replace
     * @returns {string} resulting LaTeX code
     */
    parse() {
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

module.exports = { Parser };