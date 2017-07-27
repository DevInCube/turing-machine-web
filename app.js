const path = require('path');
const express = require('express');
const favicon = require('express-favicon');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => res.render('index'));
app.get('/help/turing-machine', (req, res) => res.render('turing_machine'));
app.get('/help/turing-machine-program', (req, res) => res.render('turing_machine_program'));

module.exports = app;