'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;

const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'admin'));
const session = driver.session();

// Routes
app.get('/', (req, res) => {
    session
        .run('MATCH (n:Movie) return n LIMIT 25')
        .then((result) => {
            result.records.forEach((record) => {
                console.log(record);
            });
        })
        .catch((err) => {
            console.log(err);
        });
    res.send('It did work!!');
});
// Setup
app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;
