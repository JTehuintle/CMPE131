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

const bcrypt = require('bcryptjs'); // npm install bcrypt
const mysql = require('mysql2'); // npm install mysql2
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
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const currentProductsFile = path.resolve(
    '${__dirname}', "C:\Users\Moca\Desktop\CMPE131-main(1)\homePage.html"
)//change to your path for "homepage.html"

const bodyParser = require('body-parser');// Used to send css/images
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static('public'));

app.use(session({// users token, makes sure only logged in people are allowed to access /dashBoard
    secret: 'TeamGroup3',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 10*60*1000} 
}));

app.get('/homePage', (req, res)=>{ // Homepage of the website
    res.sendFile(path.join(__dirname + '/homePage.html'));
});
app.get('/index', (req, res)=>{ // login page of the website
    res.sendFile(path.join(__dirname + '/index.html'));
});
//to make sure dashboard is secure
app.get('/dashBoard', isAuthenticated_and_Role('employee'), (req, res)=>{ // dashboard page for the user
    res.sendFile(path.join(__dirname + '/dashBoard.html'));
});
app.get('/register', (req, res)=>{
    res.sendFile(path.join (__dirname, 'register.html'));
});
app.get('/Admin_Dashboard', isAuthenticated_and_Role('admin'), (req, res)=>{
    res.sendFile(path.join(__dirname + '/DashBoard_Admin_View.html'));
});
app.get('/Admin_Inventory', isAuthenticated_and_Role('admin'), (req, res)=>{
    res.sendFile(path.join(__dirname + '/Review_Inventory_Admin_View.html'));
});
//user logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error logging out:", err);
            return res.status(500).send("Error logging out.");
        }
        res.redirect('/index'); // Redirect to login page after logout
    });
});
function isAuthenticated_and_Role(role){
    return function(req, res, next){
        console.log("session data: ", req.session);
        if(req.session && req.session.user && req.session.user.role === role){
            return next();
        }
        else{
            return res.redirect('/index'); // redirects to login page if not logged in/ authorized
        }
    }
}
// calls mysql to check if user has accounnt, then login
// login function
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
        console.log("User ${username} attempting to log in. password match: ${isMatch}");
        if(isMatch){
            req.session.user = user;
            if(user.role === 'admin'){ // directs to admin dashboard
                console.log("User ${username} logged in successfully");
                return res.redirect('/Admin_Dashboard');
            }
            else{ // directs to employee dashboard
                console.log("User ${username} logged in successfully");
                return res.redirect('/dashBoard');
            }
        }
        else{
            console.log("invalid password attemtp for user ${username}");
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
    const {username, password, role} = req.body;
    //const hashedPassword = await bcrypt.has(password, 10);
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //storing into sql
        //console.log(username, " ",password); 
        const sql = "insert into users (username, password, role) values (?, ?, ?)";
        connection.query(sql, [username, hashedPassword, role], (err, result)=>{
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
//user wants to add new items that arent in the database (ONLY ADMINS)
app.post('/add_Product', (req, res) => {
    const {itemID, name, sku, quantity, location} = req.body;

    if(!itemID || !name || !sku || !quantity || !location){
        return res.status(400).send("All fields are required. ");
    }
    const query = 'INSERT INTO products (itemID, name, sku, quantity, location) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [itemID, name, sku, quantity, location], (err, result)=>{
        if(err){
            console.error("Error inserting product: ", err.message);
            return res.status(500).send("Error adding product to the database. :c");
        }
        res.redirect('/Admin_Dashboard');
    });
    
});
//user wants to adjust quantity 
app.post('/adjust_quantity', (req, res) => {
    const { itemID, quantity } = req.body;
    const userRole = req.session.user.role;

    if(userRole === 'admin' || userRole === "employee"){ // checks if userrol is correct
        const query = 'UPDATE products SET quantity = quantity + ? WHERE itemID = ?';

        connection.query(query, [quantity, itemID], (err, result) => {
            if (err) {
                console.error('Error updating quantity:', err);
                res.send('Error updating quantity');
            } else {
                console.log(`Quantity updated successfully for itemID: ${itemID}`); 
                // redirection based on user role
                if(userRole === 'admin'){
                    res.redirect('/Admin_Dashboard');
                }
                else if(userRole === 'employee'){
                    res.redirect('/dashBoard');
                }
            }
        });
    } else {
        res.send("User Role not found.");
    }
});
// fetch mysql stock data
app.get('/current_stock', isAuthenticated_and_Role('admin'), (req,res)=>{
    const query = 'SELECT * FROM products';
    
    connection.query(query, (err, results)=>{
        if(err){
            console.error('error getting data from sql', err);
        }
        else{
            res.json(result);
        }
    });
});

//ALERTS




//posts in console that website is located at cite. 
app.listen(port,()=>{

    console.log("The Server is running on http://localhost:3000/homePage");

});


/*references 
https://www.databasestar.com/column-count-doesnt-match-value-count/
https://stackoverflow.com/questions/55308778/typeerror-undefined-is-not-iterable-cannot-read-property-symbolsymbol-iterato
https://dev.mysql.com/downloads/
https://www.geeksforgeeks.org/node-js-connect-mysql-with-node-app/





*/