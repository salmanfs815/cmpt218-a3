
# Assignment 3
### Salman Siddiqui
### CMPT 218

---

## Features
- custom favicon
- unauthorized users are redirected to login page
- remember username of last admin to facilitate future login (forget password for security reasons)
- logout of admin account if logged in
- detect network errors (server down) and report to user
- plaintext passwords are never stored on server or in database
	- store salted, hashed passwords
- can create additional admin accounts	

## Setup

### Install Dependencies
1. `npm install`
2. create a `.env` file to store environment variables
	- the following environment variables are required:
```
PORT=
DB_HOST=
DB_NAME=
DB_USER=
DB_PASS=
```

### Run Server
`npm start`


