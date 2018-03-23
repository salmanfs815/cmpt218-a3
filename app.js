const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path')

const result = require('dotenv').config()
if (result.error) throw result.error

// mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`)
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
  time: {type: String, default: Date}
})
var Attendee = mongoose.model('attendee', attendeeSchema)

var checkinSchema = new Schema({
  checkin: String,
  session: {type: Number, default: Date.now},
  admin: String,
  start: {type: String, default: Date},
  end: {type: String, default: null},
  attendees: {type: [attendeeSchema], default: []}
})
var Checkin = mongoose.model('checkin', checkinSchema)

var app = express()
var port = process.env.PORT || 8000

var loggedIn = ''

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
  Checkin.find({
    end: null
  }, (err, docs) => {
    if (err) {
      console.log(err)
      res.sendStatus(503)
    } else {
      docs.forEach((doc) => {
        doc.end = Date()
      })
      res.sendStatus(200)
    }
  })
})

app.post('/admin', (req, res) => {
  if (loggedIn === '') {
    res.redirect(401, '/')
  } else {
    var checkinID = req.body.checkinID
    var sessionID = Date.now()
    var newCheckin = new Checkin({
      checkin: checkinID,
      session: sessionID,
      admin: loggedIn
    })
    newCheckin.save((err) => {
      if (err) {
        console.log(err)
        res.sendStatus(503)
      } else {
        res.send(sessionID.toString())
      }
    })
  }
})

app.post('/history', (req, res) => {
  if (loggedIn === '') {
    res.redirect(401, '/')
  } else {
    var ret = []
    Checkin.find({
      checkin: req.body.checkinID
    }, (err, docs) => {
      if (err) {
        console.log(err)
        res.sendStatus(503)
      } else {
        docs.forEach((doc) => {
          ret = ret.concat(doc.attendees)
        })
        res.json(ret)
      }
    })
  }
})

app.post('/adminCheckin', (req, res) => {
  if (loggedIn === '') {
    res.redirect(401, '/')
  } else {
    Checkin.findOne({
      session: req.body.sessionID
    }, (err, doc) => {
      if (err) {
        console.log(err)
        res.sendStatus(503)
      } else if (doc) {
        doc.end = Date()
        doc.save((err) => {
          if (err) {
            console.log(err)
            res.sendStatus(503)
          } else {
            res.json(doc.attendees)
          }
        })
      } else {
        res.json([])
      }
    })
  }
})

app.post('/attendeeCheckin', (req, res) => {
  Checkin.findOne({
    checkin: req.body.checkin,
    end: null
  }, (err, doc) => {
    if (err) {
      console.log(err)
      res.sendStatus(503)
    } else if (doc) {
      var newAttendee = new Attendee({
        name: req.body.name,
        id: req.body.id,
        time: Date()
      })
      doc.attendees.push(newAttendee)
      doc.save((err) => {
        if (err) {
          console.log(err)
          res.sendStatus(503)
        } else {
          res.send(doc.admin)
        }
      })
    } else {
      console.log('checkin not open for:', req.body.checkin)
      res.send('')
    }
  })
})

app.listen(port, () => console.log(`Server is listening on port ${port}`))
