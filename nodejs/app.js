const express = require('express');
var mysql = require('mysql');

var app = new express();
app.get('/',(req,res)=>{
    res.send('hello world');
});
app.listen('3000', ()=>{
    let connection = mysql.createConnection({
        host:'interview-task_default',
        port:'3306',
        user:'root',
        password:'password'
    })
    let connection2 =mysql.createConnection('database');
console.log(`Example `,connection);
console.log(`connection2 `,connection2);
});