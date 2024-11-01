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
https://www.geeksforgeeks.org/node-js-connect-mysql-with-node-app/

*/
/*
when wanting to enter mysql, use app mysql command line client.
when it asks for password enter 'root'
should start server
*/ 

const bcrypt = require('bcryptjs');
const mysql = require('mysql2'); // imports mysql
const connection = mysql.createConnection({ //creates connection
    host: 'localhost',
    port: 3306,
    database: 'Inventory_Management',
    user: 'root',
    password: 'root'
});
connection.connect((error) =>{
    if (error){
        console.error("error connecting to mysql: ", error.message);
        return;
    }
    console.log("Connected to MYSQL");
}); // it fucking works bruh

module.exports = connection;

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


app.get('/homePage', (req, res)=>{ // Homepage of the website
    res.sendfile(path.join(__dirname + '/homePage.html'));

});

app.get('/index', (req, res)=>{ // login page of the website
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/dashBoard', (req, res)=>{ // dashboard page for the user
    res.sendFile(path.join(__dirname + '/dashBoard.html'));
});
app.get('/register', (req, res)=>{
    res.sendFile(path.join (__dirname, 'register.html'));
});


app.post('/index', async(req, res)=>{
    const {username, password} = req.body;
    //call sql database
    const sql = 'select * from users where username = ?';
    connection.query(sql, [username], async (err, results)=>{
        //console.log(username, " ",password); // check username and password
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("An error occurred while accessing the database.");
        }
        //is the user isnt found
        if (results.length === 0){
            return res.status(401).send("user not found");
        }
        const user = results[0];
        // used to compare user input password and encrypted password from sql
        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            res.redirect('/dashBoard');
        }
        else{
            res.redirect('/index');
            //res.status(401).send("Password Invalid");
        }
        /* this was used to check if im able to see if user and pass is right to send to dashboard
        //checks if password entered by user is hashed password in mysql
       if(password === user.password && username === user.username){
        //res.send("Logging in . . .");
            res.redirect('/dashBoard');
       }
       else{
        res.status(401).send("invalid password");
       }*/
    });
});


//user registration 
app.post('/register', async(req, res)=>{
    const {username, password} = req.body;
    //const hashedPassword = await bcrypt.has(password, 10);
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //storing into sql
        //console.log(username, " ",password); 
        const sql = "insert into users (username, password) values (?, ?)";
        connection.query(sql, [username, hashedPassword], (err, result)=>{
            if(err){
                console.error("Error inserting user into database:", err);
                return res.status(500).send("error creating username");
            }
            //res.send("user created Successfully.");
            res.redirect('/index');
        });
    }
    catch(error){
        console.error("Error hashing: ", error);
        res.status(500).send("Error occured");
    }/* code below is used as last resort if hashed password doesnt work
    const sql = "insert into users (username, password) values (?, ?)";
    //console.log(username, " ",password); username being written correctly
    connection.query(sql, [username, password], async (err, result)=>{
        if (err) {
            console.error('SQL Error:', err.message);
            //res.status(500).send('Error registering user. Check SQL syntax.');
            return;
        }
        //res.send('user registed succesfully');
        res.redirect('/index');
    });*/
});


//posts in console that website is located at cite. 
app.listen(port,()=>{

    console.log("The Server is running on http://localhost:3000/");

});


/*references 
https://www.databasestar.com/column-count-doesnt-match-value-count/
https://stackoverflow.com/questions/55308778/typeerror-undefined-is-not-iterable-cannot-read-property-symbolsymbol-iterato
https://dev.mysql.com/downloads/
https://www.geeksforgeeks.org/node-js-connect-mysql-with-node-app/





*/