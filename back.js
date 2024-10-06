// holy fuck we are so fucked idk how to code in javascript
// we will be using sql with node.js
// node.js will be used to send data from the front end to back end
//
//https://omprakash524.medium.com/full-stack-registration-form-using-html-css-node-js-express-and-mongodb-mern-backend-188d8ed3c929 
// to start the node.js server do the folliing
// in cmd type example -> "cd C:\Users\Moca\Desktop\CMPE131-main(1)"" the locaiton of the whole project
// type npm install express mysql bcrypt body-parser (IF DOESNT WORK)
// start the app, node.js, then in the console, type "node back.js"
// in cmd, do ctrl + c to stop the server, then retype "node back.js" to start it again


const express = require('express');

const app = express();

app.get('/', (req, res)=>{
    res.sendfile(__dirname + '/index.html');
});

app.post('/login', (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;
});

app.listen(3000,()=>{

    console.log("The Server is running on http://localhost:3000/login");

});