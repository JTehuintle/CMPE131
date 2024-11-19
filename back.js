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
app.get('/Admin_Reports', isAuthenticated_and_Role('admin'), (req,res)=>{
    res.sendFile(path.join(__dirname + '/Reports_Admin_View.html'));
});
app.get("/Admin_Employee_List", isAuthenticated_and_Role('admin'), (req,res)=>{
    res.sendFile(path.join(__dirname + '/EmployeeList_Admin_View.html'));
})

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
    const { itemID, name, quantity } = req.body;
    const name_or_id = itemID || name;
    const userRole = req.session.user.role;

    if (userRole === 'admin' || userRole === "employee") { // checks if user role is correct

        const query = 'SELECT itemID, name, quantity FROM products WHERE itemID = ? OR name = ?';
        console.error({name_or_id});
        connection.query(query, [name_or_id, name_or_id], (err, result) => {
            if (err) {
                console.error('Error fetching product:', err);
                return res.status(500).send('Error fetching product data');
            }
            if (result.length === 0) { // if the results length is 0, then nada was returned
                console.error('Product not found');
                return res.status(404).send('Product not found');
            }

            const currentQuantity = result[0].quantity;
            const newQuantity = currentQuantity + quantity[0]; // Calculate the new quantity

            // Proceed with updating the quantity if valid
            //FIX THIS CANT ACTUALLY CHECK IF NEW QUANTITY IS LESS THAN 0
            if(newQuantity < 0){  // Check if the new quantity will be negative
                return res.status(400).send('Adjustment exceeds available quantity. Cannot go below zero.');
                
            }
            const updateQuery = 'UPDATE products SET quantity = quantity + ? WHERE itemID = ? OR name = ?';
            
            //console.log(updateQuery);
            connection.query(updateQuery, [quantity, name_or_id, name_or_id], (err, result) => {
                if (err) {
                    console.error('Error updating quantity:', err);
                    return res.status(500).send('Error updating quantity');
                }
            
                // Handle top sellers update if quantity was decreased
                if (quantity < 0) { // Update both M_quantity and M_sales for top sellers
                    const updateTopSellersQuery = `
                        INSERT INTO top_sellers_of_month (M_name, M_quantity, M_sales)
                        SELECT name, quantity, ABS(?) FROM products WHERE itemID = ? OR name = ?
                        ON DUPLICATE KEY UPDATE M_quantity = M_quantity + ?, M_sales = M_sales + ABS(?);
                    `;
            
                    connection.query(updateTopSellersQuery, [quantity, itemID, name_or_id, quantity, quantity], (err, result) => {
                        if (err) {
                            console.error('Error updating top sellers:', err);
                            return res.status(500).send("Error updating top sellers");
                        } else {
                            console.log(`Top seller data updated for itemID or name: ${itemID} / ${name_or_id}`);
                        }
                    });
                    console.log(`Quantity updated quantity and sales successfully for ${name_or_id}`);
                } else if (quantity > 0) { // Update only M_quantity for top sellers
                    const updateTopSellersQuery = `
                        INSERT INTO top_sellers_of_month (M_name, M_quantity)
                        SELECT name, quantity FROM products WHERE itemID = ? OR name = ?
                        ON DUPLICATE KEY UPDATE M_quantity = M_quantity + ?;
                    `;
                    
                    connection.query(updateTopSellersQuery, [itemID, name_or_id, quantity], (err, result) => {
                        if (err) {
                            console.error('Error updating top sellers:', err);
                            return res.status(500).send("Error updating top sellers");
                        } else {
                            console.log(`Top seller data updated for itemID or name: ${itemID} / ${name_or_id}`);
                        }
                    });
                    console.log(`Quantity updated quantity successfully for ${name_or_id}`);
                }
                // redirects based on user role
                if (userRole === 'admin') {
                    res.redirect('/Admin_Dashboard');
                } else if (userRole === 'employee') {
                    res.redirect('/dashBoard');
                }
            });
        });
    } else {
        res.status(403).send("User role not authorized.");
    }
});

// fetch mysql stock data
// may not need isauthenticated role
app.get('/current_stock', (req,res)=>{
    const query = 'SELECT * FROM products';
    
    connection.query(query, (err, results)=>{
        if(err){
            console.error('error getting data from sql', err);
        }
        else{
            res.json(results);
        }
    });
});
//displays top sellers for week
app.get('/W_top_sellers',(req,res)=>{
    const query = 'SELECT * FROM top_sellers_of_week';

    connection.query(query,(err, results)=>{
        if(err){
            console.error('Could not get weekly top sellers. ', err);
        }
        else{
            res.json(results);
        }
    });
});
// displays top sellers for month
app.get('/top_sellers_of_month', (req, res) => {
    const query = 'SELECT * FROM top_sellers_of_month';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching top sellers:', err);
            res.status(500).send('Error fetching data');
        } else {
            res.json(results); // Send data as JSON
        }
    });
});
// searchitem cant get to work
app.get('/search_inventory', (req, res) => {
    const searchTerm = req.query.q; // 'q' will be the search term sent from the frontend

    if (!searchTerm) {
        return res.status(400).send('Search term is required');
    }

    // Perform SQL query to search by name or location
    const query = `
        SELECT name, quantity, location 
        FROM products 
        WHERE name LIKE ? OR location LIKE ?
    `;
    const likeSearchTerm = `%${searchTerm}%`;

    connection.query(query, [likeSearchTerm, likeSearchTerm], (err, results) => {
        if (err) {
            console.error('Error searching inventory:', err);
            res.status(500).send('Error searching inventory');
        } else {
            res.json(results); // Return matching results as JSON
        }
    });
});
// Fetch Employee list
app.get('/employee_list', (req, res)=>{
    const query = 'SELECT * FROM users';
    connection.query(query, (err, results)=>{
        if(err){
            console.error('Error fetching employee data: ', err);
            res.status(500).send('Error fetching employee Data.');
        }
        else{
            res.json(results);
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