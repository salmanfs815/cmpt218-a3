const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path')

const result = require('dotenv').config()
if (result.error) throw result.error

//mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`)
mongoose.connect(process.env.DB_URL)

var Schema = mongoose.Schema

var adminSchema = new Schema({
  user: String,
  pass: String
})
var Admin = mongoose.model('admin', adminSchema)

var attendeeSchema = new Schema({
  name: String,
  id: String,
  time: String
})
var Attendee = mongoose.model('attendee', attendeeSchema)

var sessionSchema = new Schema({
  id: Number,
  admin: String,
  start: String,
  end: String,
  attendees: [attendeeSchema]
})
var Session = mongoose.model('session', sessionSchema)

var checkinSchema = new Schema({
  id: String,
  sessions: [sessionSchema]
})
var Checkin = mongoose.model('checkin', checkinSchema)

var app = express()
var port = process.env.PORT || 8000

var loggedIn = ''
var checkinID = ''
var sessionID = NaN

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

app.post('/', (req, res) => {
  Admin.findOne({'user': req.body.user}, (err, doc) => {
    if (!err && doc && bcrypt.compareSync(req.body.pass, doc.pass)) {
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
    var newSession = new Session({
      id: sessionID,
      admin: loggedIn,
      start: Date(),
      end: null,
      attendees: []
    })

    Checkin.findOne({id: checkinID})
    .then((doc) => { 
      if (doc) { 
        doc.sessions.push(newSession)
        doc.save((err) => { 
          if (err) console.log(err)
          else res.send(sessionID.toString())
        })
      } else { 
        var newCheckin = new Checkin({
          id: checkinID, 
          sessions: [newSession]
        })
        newCheckin.save((err) => { 
          if (err) console.log(err)
          else res.send(sessionID.toString()) 
        }) 
      } 
    })
  }
})

app.post('/history', (req, res) => {
  if (loggedIn === '') {
    res.redirect(401, '/')
  } else {
    checkin = req.body.checkinID
    // res.json(prepareJSON(checkinID))
    var ret = []
    Checkin.findOne({id: checkin}, (err, doc) => {
      if (err) {
        console.log(err)
        console.log('ERROR: DB query failed')
      } else if (doc) {
        doc.sessions.forEach((session) => {
          session.attendees.forEach((person) => {
            ret.push({
              name: person.name,
              id: person.id,
              time: person.time,
              session: session.id
            })
          })
        })
      }
      res.json(ret)
    })
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
    var newAttendee = new Attendee({
      name: req.body.name,
      id: req.body.id,
      time: Date()
    })

    checkins[checkinID][sessionID]['attendees'].push(attendee)
    // add attendee to checkin
    res.send(loggedIn)
  } else {
    res.send('')
  }
})

app.listen(port, () => console.log(`Server is listening on port ${port}`))
