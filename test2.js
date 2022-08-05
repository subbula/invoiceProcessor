const PDFDocument = require('pdfkit');
const fs = require('fs');

let pdfDoc = new PDFDocument;
pdfDoc.pipe(fs.createWriteStream('SampleDocument.pdf'));
pdfDoc.text("My Sample PDF Document");
pdfDoc.end();




// https://stackabuse.com/generating-pdf-files-in-node-js-with-pdfkit/

// 992165652628


// You could capture the stream instance in a closure:

class Foobar {
    constructor(client) {
        this.client = client;
        this.collection = [];
        this.error;
    }
    getByProductName(query, params) {
        const stream = this.client.stream(query, params, { prepare: true })
            .on('readable', () => {
                var row;
                while(row = stream.read()) { // <- use stream instance 
                    this.collection.push(row);
                }
            })
            .on('error', err => {
                if(err) {
                    this.error = err;
                }
            })
            .on('end', () => {
                console.log('end');
            });
    }
}