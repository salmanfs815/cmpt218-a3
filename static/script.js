
var app = new Vue({
	el: '#app',
	data: {
		// available views: 'adminLogin', 'adminLanding', 'history',
		//		'adminCheckin', 'adminDone', 'attendeeCheckin', 'attendeeDone'
		view: 'adminLogin',
		loginErr: false,
		/*adminUser: '',
		adminPass: '',
		checkinID: '',
		sessionID: '',
		attendeeName: '',
		attendeeID: '',
		attendeeCheckinID: ''*/
		adminUser: 'salman',
		adminPass: 'siddiqui',
		checkinID: 'CMPT218',
		sessionID: '',
		attendeeName: 'Bob Smith',
		attendeeID: '123456789',
		attendeeCheckinID: 'CMPT218'
	},
	methods: {
		adminLogin() {
			// axios post to '/': user = this.adminUser, pass = this.adminPass
			axios.post('/', {
				user: this.adminUser,
				pass: this.adminPass
			}).then((res) => {
				console.log(res)
				if(res.data == true) {
					this.adminPass = '';
					this.view = 'adminLanding';
				} else {
					this.loginErr = true;
				}
			}).catch((err) => {
				console.log(err);
			});
		},
		adminLogout() {
			axios.post('/logout', {})
			.catch((err) => {
				console.log(err);
			});
			this.sessionID = '';
			this.view = 'adminLogin';
		},
		adminCheckin() {
			// axios post to '/admin': checkinID = this.checkinID
			axios.post('/admin', {
				checkinID: this.checkinID
			}).then((res) => {
				this.sessionID = res.data.toString();
				console.log('Session ID:', this.sessionID);
			}).catch((err) => {
				console.log(err);
			});
			this.view = 'adminCheckin';
		},
		history() {
			// axios post to '/history': checkinID = this.checkinID
			axios.post('/history', {
				checkinID = this.checkinID
			}).then((res) => {
				// res is JSON that needs to be displayed in tbody of view
			}).catch((err) => {
				console.log(err);
			});
			this.view = 'history';
		},
		adminEndCheckin() {
			// axios post to '/adminCheckin': checkinID = this.checkinID
			axios.post('/adminCheckin', {
				checkinID = this.checkinID
			}).then((res) => {
				// res is JSON that needs to be displayed in tbody of view
			});
			this.view = 'adminDone';
		},
		attendeeCheckin() {
			// axios post to '/attendeeCheckin': name = this.attendeeName,
			//		id = this.attendeeID, checkin = this.attendeeCheckinID
			axios.post('/attendeeCheckin', {
				name: this.attendeeName,
				id: this.attendeeID,
				checkin: this.attendeeCheckinID
			}).then((res) => {
				this.adminUser = res;
			}).catch((err) => {
				console.log(err);
			});
			this.view = 'attendeeDone';
		}
	}
});
