const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const result = require('dotenv').config()
if (result.error) throw result.error

mongoose.connect(process.env.DB_URL)

var adminSchema = new mongoose.Schema({
  user: { type: String },
  pass: { type: String }
})
var Admin = mongoose.model('admin', adminSchema)


function addAdmin (username, password) {
  Admin.find({'user': username}, (err, docs) => {
    if (err) {
      console.log(err)
      process.exit(1)
    } else if (docs.length > 0) {
      console.log('Account not created. An admin account with that username already exists. Please try something fresh.')
      process.exit(0)
    } else {
      var admin = new Admin({
        user: username,
        pass: bcrypt.hashSync(password, 8)
      })
      admin.save((err) => {
        if (err) {
          console.log(err)
          process.exit(1)
        } else console.log('Successfully created new admin account.')
        process.exit(0)
      })
    }
  })
}

function delAdmin (user) {

}

if (process.argv[2] === 'add') {
  addAdmin(process.argv[3], process.argv[4])
} else if (process.argv[2] === 'del') {
  delAdmin(process.argv[3])
} else {
  console.log(`
Usage: node admin.js <command>

where <command> is one of: add, del

node admin.js add <username> <password>    create admin account
node admin.js del <username>               delete admin account
`)
  process.exit(0)
}
