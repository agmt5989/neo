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
            let movieArray = [];
            result.records.forEach((record) => {
                movieArray.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.title,
                    year: record._fields[0].properties.year,
                });
            });

            session
                .run('MATCH (n:Person) return n LIMIT 25')
                .then((result1) => {
                    let actorArray = [];
                    result1.records.forEach((rec) => {
                        actorArray.push({
                            id: rec._fields[0].identity.low,
                            name: rec._fields[0].properties.name,
                        });

                    });
                    res.render('index', {
                        movies: movieArray,
                        actors: actorArray,
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
});
// Setup
app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;
