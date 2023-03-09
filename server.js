const express = require('express')
const cookieParser = require('cookie-parser')

const bugService = require('./services/bug.service')
const userService = require('./services/user.service')

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello bug!'))

app.get('/api/bug', (req, res) => {
     const { txt, severity, page, label, sort, } = req.query
     const filterBy = {
          txt,
          severity: +severity,
          page,
          label,
          sort,
     }
     bugService.query(filterBy)
          .then(queryObj => {
               res.send(queryObj)
          })
          .catch((err) => {
               console.log('Error:', err)
               res.status(400).send('Cannot load bugs')
          })

})

app.get('/api/bug/buildPDF', (req, res) => {
     bugService.query().then(queryObj => {
          const { bugs } = queryObj
          bugService.buildBugsPDF(bugs)
               .then(fileName => { //! doesn't work
                    res.download(`Bugs.pdf`, (err) => {
                         if (err) {
                              console.error(err)
                              res.status(500).send('Error downloading file')
                         } else {
                              console.log('File downloaded successfully')
                         }
                    })
               })
     })
})
app.put('/api/bug/:bugId', (req, res) => {
     const loggedInUser = userService.validateToken(req.cookies.loginToken)
     if (!loggedInUser) return res.status(401).send('Cannot update bug')
     const { _id, title, description, severity, labels } = req.body
     const bug = {
          _id: _id || null,
          title,
          description,
          severity: +severity,
          labels,
          createdAt: Date.now()
     }
     bugService.save(bug, loggedInUser)
          .then(savedBug => {
               res.send(savedBug)
          })
          .catch(err => {
               console.log('Cannot save bug, Error:', err)
               res.status(400).send('Cannot save bug')
          })
})
app.post('/api/bug', (req, res) => {
     const loggedInUser = userService.validateToken(req.cookies.loginToken)
     if (!loggedInUser) return res.status(401).send('Cannot add bug')
     const { title, description, severity, labels, createdAt } = req.body
     const bug = {
          title: title,
          description: description,
          severity: +severity,
          labels,
          createdAt: createdAt || Date.now(),
     }
     bugService.save(bug, loggedInUser)
          .then(savedBug => {
               res.send(savedBug)
          })
          .catch(err => {
               console.log('Cannot save bug, Error:', err)
               res.status(400).send('Cannot save bug')
          })
})

app.get('/api/bug/:bugId', (req, res) => {
     const { bugId } = req.params
     const visitCount = req.cookies.visitCount || []
     visitCount.push(bugId)
     if (visitCount.length > 3) return res.status(401).send('Wait for a bit')
     res.cookie('visitCount', visitCount, { maxAge: 7 * 1000 })
     bugService.get(bugId)
          .then(bug => {
               res.send(bug)
          })
          .catch((err) => {
               console.log('Error:', err)
               res.status(400).send('Cannot load bug')
          })
})

app.delete('/api/bug/:bugId', (req, res) => {
     const loggedInUser = userService.validateToken(req.cookies.loginToken)
     if (!loggedInUser) return res.status(401).send('Cannot remove bug')
     const { bugId } = req.params
     bugService.remove(bugId, loggedInUser)
          .then(() => {
               res.send('Bug deleted')
          })
          .catch((err) => {
               console.log('Error:', err)
               res.status(400).send('Cannot remove bug')
          })
})

// Users

app.get('/api/user', (req, res) => {

     userService.query()
          .then(users => {
               res.send(users)
          })
          .catch((err) => {
               console.log('Error:', err)
               res.status(400).send('Cannot load users')
          })

})

app.put('/api/user/:userId', (req, res) => {
     const { _id, username, fullName, password } = req.body
     const user = { _id, username, fullName, password }

     userService.save(user)
          .then(savedUser => {
               res.send(savedUser)
          })
          .catch(err => {
               console.log('Cannot save user, Error:', err)
               res.status(400).send('Cannot save user')
          })
})

app.post('/api/user', (req, res) => {
     const { username, fullName, password, isAdmin } = req.body
     const user = { username, fullName, password, isAdmin }

     userService.save(user)
          .then(savedUser => {
               res.send(savedUser)
          })
          .catch(err => {
               console.log('Cannot save user, Error:', err)
               res.status(400).send('Cannot save user')
          })
})

app.get('/api/user/:userId', (req, res) => {
     const { userId } = req.params
     userService.getById(userId)
          .then(user => {
               res.send(user)
          })
          .catch((err) => {
               console.log('Error:', err)
               res.status(400).send('Cannot load user')
          })
})

app.delete('/api/user/:userId', (req, res) => {
     const { userId } = req.params
     userService.remove(userId)
          .then(() => {
               res.send('OK, deleted')
          })
          .catch((err) => {
               console.log('Error:', err)
               res.status(400).send('Cannot remove user')
          })
})

app.post('/api/auth/logout', (req, res) => {
     res.clearCookie('loginToken')
     res.send('Loggedout')
})

app.post('/api/auth/login', (req, res) => {
     const credentials = req.body
     userService.checkLogin(credentials)
          .then(user => {
               if (user) {
                    const loginToken = userService.getLoginToken(user)
                    res.cookie('loginToken', loginToken)
                    res.send(user)
               } else {
                    res.status(401).send('Invalid Credentials')
               }
          })
})
app.post('/api/auth/signup', (req, res) => {
     const credentials = req.body
     userService.save(credentials)
          .then(user => {
               if (user) {
                    const loginToken = userService.getLoginToken(user)
                    res.cookie('loginToken', loginToken)
                    res.send(user)
               } else {
                    res.status(401).send('Invalid Credentials')
               }
          })
})

const port = process.env.PORT || 3030
app.listen(port, () => console.log('Server ready at port 3030!'))