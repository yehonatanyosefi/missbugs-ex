const PDFDocument = require('pdfkit')
const fs = require('fs')

module.exports = {
     buildBugsPDF,
}

function buildBugsPDF(bugs, fileName = 'Bugs.pdf') {
     bugs = bugs.bugs
     const doc = new PDFDocument()
     doc.pipe(fs.createWriteStream(fileName))
     doc.fontSize(20)
     // .list(bugs)
     bugs.forEach(bug => {
          doc.text(`${bug.title} has severity of ${bug.severity}`)
     })
     doc.end()
     return Promise.resolve(doc)
}