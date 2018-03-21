const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path')

const result = require('dotenv').config()
if (result.error) throw result.error

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`)

var app = express()
var port = process.env.PORT || 8000

var Schema = mongoose.Schema
var adminSchema = new Schema({
  user: { type: String },
  pass: { type: String }
})
var Admin = mongoose.model('admin', adminSchema)

var loggedIn = ''
var checkinID = ''
var sessionID = NaN

var checkins = {}

app.use('/', (req, res, next) => {
  console.log(req.method, 'request:', req.url)
  next()
})

app.use(express.static('static'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'favicon.ico'))
})

function prepareJSON (checkin) {
  var res = []
  for (var sess in checkins[checkin]) {
    checkins[checkin][sess]['attendees'].forEach((user) => {
      res.push({
        name: user.name,
        id: user.id,
        time: user.time,
        session: sess
      })
    })
  }
  return res
}

app.post('/', (req, res) => {
  Admin.find({'user': req.body.user}, (err, docs) => {
    if (!err && docs.length > 0 &&
      bcrypt.compareSync(req.body.pass, docs[0].pass)) {
      loggedIn = req.body.user
      res.send('true')
    } else {
      if (err) console.log(err)
      loggedIn = ''
      res.send('false')
    }
  })
})

app.post('/logout', (req, res) => {
  loggedIn = ''
  sessionID = NaN
  checkinID = ''
  res.sendStatus(200)
})

app.post('/admin', (req, res) => {
  if (loggedIn === '') {
    res.redirect(401, '/')
  } else {
    checkinID = req.body.checkinID
    sessionID = Date.now()
    var sessionObj = {
      'admin': loggedIn,
      'start': Date(),
      'end': null,
      'attendees': []
    }
    if (!(checkinID in checkins)) {
      checkins[checkinID] = {}
    }
    checkins[checkinID][sessionID] = sessionObj
    res.send(sessionID.toString())
  }
})

app.post('/history', (req, res) => {
  if (loggedIn === '') {
    res.redirect(401, '/')
  } else {
    checkinID = req.body.checkinID
    res.json(prepareJSON(checkinID))
  }
})

app.post('/adminCheckin', (req, res) => {
  if (loggedIn === '') {
    res.redirect(401, '/')
  } else {
    var checkin = req.body.checkinID
    var session = req.body.sessionID
    checkins[checkin][session]['end'] = Date()
    res.json(checkins[checkin][session]['attendees'])
    sessionID = NaN
    checkinID = ''
  }
})

app.post('/attendeeCheckin', (req, res) => {
  var checkin = req.body.checkin
  // check if checkin is open
  if (checkinID === checkin) {
    var attendee = {
      name: req.body.name,
      id: req.body.id,
      time: Date()
    }
    checkins[checkinID][sessionID]['attendees'].push(attendee)
    // add attendee to checkin
    res.send(loggedIn)
  } else {
    res.send('')
  }
})

app.listen(port, () => console.log(`Server is listening on port ${port}`))
