const mysql = require('mysql'); // imports mysql
const connection = mysql.createConnection({ //creates connection
    host: 'localhost',
    port: 3306,
    database: 'test',
    user: 'root',
    password: 'root'
})
connection.connect(function(err){
    if (err){
        console.log("Error occured cant connect");
    }
    else{
        console.log("connection established");
    }
});