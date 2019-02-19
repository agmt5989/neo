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

const driver = neo4j.driver('bolt://127.0.0.1', neo4j.auth.basic('neo4j', 'admin'));
const session = driver.session();

// Routes
app.get('/', (req, res) => {
    let movieArray = [];
    /*// res.sendStatus(200);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Allow-Control-Access-Origin', '*');
    res.write('<table>\n' +
        '    <thead>\n' +
        '    <tr>\n' +
        '        <th>id</th>\n' +
        '        <th>title</th>\n' +
        '        <th>year</th>\n' +
        '    </tr>\n' +
        '    </thead>\n' +
        '    <tbody>\n');
    for (let i = 0; i < 100000; i++) {
        res.write('<tr>\n' +
            '            <td>' + (i + 1) + '</td>\n' +
            '            <td>' + 2 * (i + 1) + '</td>\n' +
            '            <td>' + 10 * (i + 1) + '</td>\n' +
            '        </tr>\n');
    }
    res.write('</tbody>\n' +
        '</table>');
    res.end();*/
    session
        .run('MATCH (n:Movie) return n LIMIT 250')
        .subscribe({
            onNext: (rec) => {
                let frec = {
                    id: rec._fields[0].identity.low,
                    title: rec._fields[0].properties.title,
                    year: rec._fields[0].properties.released.low,
                };
                movieArray.push(rec);
                // console.log(frec);
                res.write(JSON.stringify(frec) + '\n\n');
                /*session
                    .run('MATCH (n:Person) return n LIMIT 25')
                    .then((result1) => {
                        let actorArray = [];
                        result1.records.forEach((rec) => {
                            actorArray.push({
                                id: rec._fields[0].identity.low,
                                name: rec._fields[0].properties.name,
                            });
                        });

                        /!*res.render('index', {
                            movies: movieArray,
                            actors: actorArray,
                        });*!/
                    })
                    .catch((err) => {
                        console.log(err);
                    });*/
            },
            onCompleted: () => {
                session
                    .run('MATCH (n:Person) return n LIMIT 250')
                    .subscribe({
                        onNext: (p) => {
                            let fp = {
                                id: p._fields[0].identity.low,
                                name: p._fields[0].properties.name,
                            };
                            console.log(fp);
                            res.write(JSON.stringify(fp) + '\n\n');
                        },
                        onCompleted: () => {
                            session.close();
                            res.end();
                            },
                        onError: (e) => {
                            console.log(e);
                        },
                    });
            },
            onError: (err) => {
                console.log(err);
            },
        });
});

app.get('/register', (req, res) => {
    res.render('reg');
});

app.post('/register')

app.get('/batch', (req, res) => {
    session
        .run('MATCH (n:Movie) return n LIMIT 25')
        .then((result) => {
            let movieArray = [];
            result.records.forEach((record) => {
                movieArray.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.title,
                    year: record._fields[0].properties.released.low,
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

app.post('/movie/add', (req, res) => {
    let name = req.body.title;
    let year = req.body.released;
    let tag = req.body.tag;

    session
        .run('CREATE (n:Movie {title: {titleParam}, released: {yearParam}, tagline: {tagParam}}) RETURN n.title', {
            titleParam: name,
            yearParam: year,
            tagParam: tag
        })
        .then(() => {
            res.redirect('/');
            session.close();
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/actor/add', (req, res) => {
    let name = req.body.name;
    let year = req.body.year;

    session
        .run('CREATE (n:Person {name: {nameParam}, born: {yearParam}}) RETURN n.name', {
            nameParam: name,
            yearParam: year
        })
        .then(() => {
            res.redirect('/');
            session.close();
        })
        .catch((err) => {
            console.log(err);
        });
});

// Setup
app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;
