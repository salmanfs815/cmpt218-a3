
# Assignment 3
### Salman Siddiqui
### CMPT 218

---

## Features
- custom favicon
- unauthorized users are redirected to login page
- remember username of last admin to facilitate future login (forget password for security reasons)
- logout button to logout of admin account (when logged in)
- detect network errors (server down) and report to user
- plaintext passwords are never stored on server or in database (encrypted)
- can create additional admin accounts	

## Setup

### Install Dependencies
1. `npm install`
2. create a `.env` file to store environment variables
	- the following environment variables are required:
		- PORT is the port number to run the server on
		- DB_URL is the complete URL for the database: `mongo://<username>:<password>@<hostname>/<database>[?authSource=admin]`
```
PORT=
DB_URL=
```

### Run Server
`npm start`


