const express = require('express');
const fs = require('fs');
const path = require('path');

var app = express();
var port = process.env.PORT || 23298;

var admin = {user: 'salman', pass: 'siddiqui'};
var loggedIn = false;
var sessionID = NaN;

var checkins = {};

app.use('/', (req, res, next) => {
	console.log(req.method, 'request:', req.url);
	next();
});

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/favicon.ico', (req, res) => {
	res.sendFile(path.join(__dirname, 'static', 'favicon.ico'));
});

app.post('/', (req, res) => {
	if (req.body.user === admin.user &&
		req.body.pass === admin.pass) {
		loggedIn = true;
		res.send('true');
	} else {
		loggedIn = false;
		res.send('false');
	}
});

app.post('/logout', (req, res) => {
	loggedIn = false;
	sessionID = NaN;
	res.sendStatus(200);
});

app.post('/admin', (req,res) => {
	if(!loggedIn) {
		res.redirect('/');
	} else {
		sessionID = Date.now();
		res.send(sessionID.toString());
	}
});

app.post('/history', (req, res) => {
	if(!loggedIn) {
		res.redirect('/');
	} else {
		checkinID = req.body.checkinID;
		res.json(/* full checkin history */);
	}
});

app.post('/adminCheckin', (req, res) => {
	if(!loggedIn) {
		res.redirect('/');
	} else {
		checkinID = req.body.checkinID;
		res.json(/* checkin history for current session */);
		sessionID = NaN;
	}
});

app.post('/attendeeCheckin', (req, res) => {
	var checkin = req.body.checkin;
	// check if checkin is open
	var attendee = {
		name: req.body.name,
		id:  req.body.id,
		time: Date()
	};
	// add attendee to checkin
	res.send(admin.user);
});

app.listen(port, () => console.log(`Server is listening on port ${port}`));
