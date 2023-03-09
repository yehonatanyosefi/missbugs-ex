
const fs = require('fs')
const gBugs = require('../data/bug.json')
const PdfService = require('./pdf.service')

const PAGE_SIZE = 3

module.exports = {
     query,
     get,
     remove,
     save,
     buildBugsPDF,
}

function query(filterBy = { txt: '', severity: 1, page: 0, label: '', sort: 'title' }) {
     const regex = new RegExp(filterBy.txt, 'i')
     let bugs = gBugs.filter(bug => {
          const label = (!filterBy.label) ? true : bug.labels.includes(filterBy.label)
          return (regex.test(bug.title) || regex.test(bug.description))
               && bug.severity >= filterBy.severity
               && label
     })
     if (filterBy.page) {
          const startIdx = filterBy.page * PAGE_SIZE
          bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
     }
     if (bugs.length) bugs = sort(bugs, filterBy.sort)
     const queryObj = { bugs, pageSize: PAGE_SIZE, length: gBugs.length }
     return Promise.resolve(queryObj)
}

function sort(bugs, varName) { //bugs[0].title
     if (typeof bugs[0][varName] === 'number') {
          return bugs.sort((a, b) => a[varName] - b[varName])
     }
     return bugs.sort((item1, item2) => item1[varName].localeCompare(item2[varName]))
}

function get(bugId) {
     const bug = gBugs.find(bug => bug._id === bugId)
     if (!bug) return Promise.reject('Unknown bug')
     return Promise.resolve(bug)
}

function remove(bugId, loggedInUser) {
     const idx = gBugs.findIndex(bug => bug._id === bugId)
     if (idx === -1) return Promise.reject('Unknown bug')
     if (gBugs[idx].owner._id !== loggedInUser._id && !loggedInUser.isAdmin) return Promise.reject('Not your bug')
     gBugs.splice(idx, 1)
     return _saveBugsToFile()
}

function save(bug, loggedInUser) {
     var savedBug
     if (bug._id) {
          savedBug = gBugs.find(currBug => currBug._id === bug._id)
          if (!savedBug) return Promise.reject('Unknown bug')
          if (savedBug.owner._id !== loggedInUser._id && !loggedInUser.isAdmin) return Promise.reject('Not your bug')
          savedBug.title = bug.title
          savedBug.severity = bug.severity
          savedBug.description = bug.description
          savedBug.labels = bug.labels
     } else {
          savedBug = {
               _id: _makeId(),
               title: bug.title,
               severity: bug.severity,
               description: bug.description,
               labels: bug.labels,
               owner: loggedInUser,
               createdAt: bug.createdAt,
          }
          gBugs.push(savedBug)
     }
     return _saveBugsToFile().then(() => {
          return savedBug
     })
}

function buildBugsPDF() {
     return query()
          .then(bugs => PdfService.buildBugsPDF(bugs))
}

function _makeId(length = 5) {
     var txt = ''
     var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     for (let i = 0; i < length; i++) {
          txt += possible.charAt(Math.floor(Math.random() * possible.length))
     }
     return txt
}

function _saveBugsToFile() {
     return new Promise((resolve, reject) => {
          const data = JSON.stringify(gBugs, null, 2)

          fs.writeFile('data/bug.json', data, (err) => {
               if (err) return reject(err)
               resolve()
          })
     })
}
