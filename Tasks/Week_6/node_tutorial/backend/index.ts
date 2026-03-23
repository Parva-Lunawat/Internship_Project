// import dotenv from 'dotenv';
// // require('dotenv').config()
// import express from "express"; // module js style; asynchronous
// // const {express} = require('express') // commmonjs style; synchronous loading ad fetching

// dotenv.config();

// const app = express();

// app.get('/', (req, res) => {
//     res.send('Hello World')
// });

// app.get('/login', (req, res) => {
//     res.send('<h1>Good Lord</h1>');
// });

// app.listen(process.env.PORT, () => {
//     console.log(`Example app listening on Port: ${process.env.PORT}`)
// });

// console.log("Hello World!!");

import dotenv from 'dotenv';
import express from "express";

import getQuotesService from './services/quoteService.ts';
import getQuotesController from './controller/quoteController.ts';
import getQuotesRoute from './router/quotesRouter.ts';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

//quotes area
const quotesService = getQuotesService({
    url: "https://thequoteshub.com/api/random-quote?format=json",
    timer: 20000,
});
const quotesController = getQuotesController(quotesService);
const quotesRouter = getQuotesRoute(quotesController, quotesService);

app.use(quotesRouter);
// quotes area end

app.get('/', (req, res) => {
    res.send("New Start brother!!");
});


app.listen(port, () => {
    console.log(`Website served at: http://localhost:${port}`);
});