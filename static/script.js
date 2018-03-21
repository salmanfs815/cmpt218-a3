
var app = new Vue({
  el: '#app',
  data: {
    // available views: 'adminLogin', 'adminLanding', 'history',
    //    'adminCheckin', 'adminDone', 'attendeeCheckin', 'attendeeDone'
    view: 'adminLogin',
    loginErr: false,
    networkErr: false,

    adminUser: '',
    adminPass: '',
    checkinID: '',
    sessionID: '',
    attendeeName: '',
    attendeeID: '',
    attendeeCheckinID: '',

    checkinHistory: [],
    sessionHistory: []
  },
  methods: {
    adminLogin () {
      // axios post to '/': user = this.adminUser, pass = this.adminPass
      axios.post('/', {
        user: this.adminUser,
        pass: this.adminPass
      }).then((res) => {
        this.networkErr = false
        if (res.data === true) {
          this.loginErr = false
          this.adminPass = ''
          this.view = 'adminLanding'
        } else {
          this.loginErr = true
        }
      }).catch((err) => {
        if (err.message === 'Network Error') {
          this.networkErr = true
        } else {
          console.log(err)
        }
      })
    },
    adminLogout () {
      axios.post('/logout', {})
        .catch((err) => {
          if (err.message === 'Network Error') {
            this.networkErr = true
          } else {
            console.log(err)
          }
        })
      this.sessionID = ''
      this.view = 'adminLogin'
    },
    adminCheckin () {
      // axios post to '/admin': checkinID = this.checkinID
      axios.post('/admin', {
        checkinID: this.checkinID
      }).then((res) => {
        this.networkErr = false
        this.sessionID = res.data.toString()
        this.view = 'adminCheckin'
      }).catch((err) => {
        if (err.message === 'Network Error') {
          this.networkErr = true
        } else if (err.response.status === 401) {
          alert('Please log in to continue.')
          this.view = 'adminLogin'
        } else {
          console.log(err)
        }
      })
    },
    history () {
      // axios post to '/history': checkinID = this.checkinID
      axios.post('/history', {
        checkinID: this.checkinID
      }).then((res) => {
        this.networkErr = false
        // res is JSON that needs to be displayed in tbody of view
        this.checkinHistory = res.data
        this.view = 'history'
      }).catch((err) => {
        if (err.message === 'Network Error') {
          this.networkErr = true
        } else if (err.response && err.response.status === 401) {
          alert('Please log in to continue.')
          this.view = 'adminLogin'
        } else {
          console.log(err)
        }
      })
    },
    adminEndCheckin () {
      // axios post to '/adminCheckin': checkinID = this.checkinID
      axios.post('/adminCheckin', {
        sessionID: this.sessionID,
        checkinID: this.checkinID
      }).then((res) => {
        this.networkErr = false
        // res is JSON that needs to be displayed in tbody of view
        this.sessionHistory = res.data
        this.view = 'adminDone'
      }).catch((err) => {
        if (err.message === 'Network Error') {
          this.networkErr = true
        } else if (err.response && err.response.status === 401) {
          alert('Please log in to continue.')
          this.view = 'adminLogin'
        } else {
          console.log(err)
        }
      })
    },
    attendeeCheckin () {
      // axios post to '/attendeeCheckin': name = this.attendeeName,
      //    id = this.attendeeID, checkin = this.attendeeCheckinID
      axios.post('/attendeeCheckin', {
        name: this.attendeeName,
        id: this.attendeeID,
        checkin: this.attendeeCheckinID
      }).then((res) => {
        this.networkErr = false
        if (res.data === '') {
          alert('Sorry, check in for ' + this.attendeeCheckinID + ' is currently closed.')
        } else {
          this.adminUser = res.data
          this.view = 'attendeeDone'
        }
      }).catch((err) => {
        if (err.message === 'Network Error') {
          this.networkErr = true
        } else {
          console.log(err)
        }
      })
    }
  }
})
