'use strict'
import { utilService } from './util.service.js'

const BUG_KEY = 'bugDB'

_createBugs()

export const bugService = {
  query,
  get,
  remove,
  save,
  getEmptyBug,
  buildBugsPDF,
}

function query(filterBy = {}) {
  return axios.get(`/api/bug`, { params: filterBy })
    .then(res => res.data)
}


function get(bugId) {
  return axios.get(`/api/bug/${bugId}`)
    .then(res => res.data)
    .catch(err => {
      if (err.response.status === 401) throw new Error('You viewed more than 3 bugs at a short time')
      return err
    })
}

function remove(bugId) {
  return axios.delete(`/api/bug/${bugId}`)
    .then(res => res.data)
}

function save(bug) {
  if (bug._id) {
    return axios.put(`/api/bug/${bug._id}`, bug)
      .then(res => res.data)
  } else {
    return axios.post(`/api/bug`, bug)
      .then(res => res.data)
  }
}

function buildBugsPDF() {
  return axios.get(`/api/bug/buildPDF`)
}

function getEmptyBug(title = '', description = '', severity = 2, labels = []) {
  return { _id: '', title, description, severity, labels }
}

function _createBugs() {
  let bugs = utilService.loadFromStorage(BUG_KEY)
  if (!bugs || !bugs.length) {
    bugs = []
    bugs.push(_createBug(`Can't remove user's cookies`, 2))
    bugs.push(_createBug(`Can't save book`, 2))
    bugs.push(_createBug(`Can't show animation`, 1))
    bugs.push(_createBug(`Home not found`, 3))
    utilService.saveToStorage(BUG_KEY, bugs)
  }
}

function _createBug(title, severity = 2, description = 'fhdiosgfdshfgfhd') {
  const bug = getEmptyBug(title, description, severity)
  bug._id = utilService.makeId()
  return bug
}


// import { storageService } from './async-storage.service.js'

// export const bugService = {
//   query,
//   getById,
//   getEmptyBug,
//   save,
//   remove,
// }

// function query() {
//   return storageService.query(STORAGE_KEY)
// }

// function remove(bugId) {
//   return storageService.remove(STORAGE_KEY, bugId)
// }

// function getById(bugId) {
//   return storageService.get(STORAGE_KEY, bugId)
// }

// function save(bug) {
//   if (bug._id) {
//     return storageService.put(STORAGE_KEY, bug)
//   }
//   return storageService.post(STORAGE_KEY, bug)
// }

// function getEmptyBug() {
//   return {
//     title: '',
//     severity: '',
//   }
// }