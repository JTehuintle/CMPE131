// holy fuck we are so fucked idk how to code in javascript
// we will be using sql with node.js
// node.js will be used to send data from the front end to back end
//
//
// to start the node.js server do the folliing
// in cmd type example -> "cd C:\Users\Moca\Desktop\CMPE131-main(1)"" the locaiton of the whole project
// type npm install express mysql bcrypt body-parser (IF DOESNT WORK)
// start the app, node.js, then in the console, type "node back.js"
// in cmd, do ctrl + c to stop the server, then retype "node back.js" to start it again

/*Links to help
https://codeshack.io/basic-login-system-nodejs-express-mysql/
https://omprakash524.medium.com/full-stack-registration-form-using-html-css-node-js-express-and-mongodb-mern-backend-188d8ed3c929 

*/
//const mysql = require('mysql');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const currentProductsFile = path.resolve(
    '${__dirname}', "C:\Users\Moca\Desktop\CMPE131-main(1)\homePage.html"
)//change to your path for "homepage.html"

const bodyParser = require('body-parser');// Used to send css/images
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res)=>{ // Homepage of the website
    res.sendfile(path.join(__dirname + '/homePage.html'));

});

app.get('/login', (req, res)=>{ // login page of the website
    res.sendfile(path.join(__dirname + '/index.html'));
});

app.post('/login',function(request,response){

});


// app.post('/login', (req, res)=>{
//     const username = req.body.username;
//     const password = req.body.password;
// });

app.listen(port,()=>{

    console.log("The Server is running on http://localhost:3000/");

});