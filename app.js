'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set
