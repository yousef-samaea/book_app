'use strict';

///////////////////////
// Dependencies     //
/////////////////////


// DOTENV (Read the env variables)
require('dotenv').config();


// Express Framework
const express = require('express');

// CORS (Cross Origin Resource Sharing)
const cors = require('cors');

// Superagent
const superagent = require('superagent');


/////////////////////////////
//// Application Setup    //
///////////////////////////

// Setting the PORT
const PORT = process.env.PORT || 3000 ;

// Running express on our app
const app = express();

// use CORS
app.use(cors());

// use middleware to have the data in the req body
app.use(express.urlencoded({ extended: true }));



/////////////////////////////
//// Templating Engine /////
///////////////////////////

// Use the static dir
app.use(express.static('./public'));

// Set EJS view engine
app.set('view engine', 'ejs');


////////////////////
//// ROUTES  //////
//////////////////

app.get('/', homeHandler);

app.get('/searches/new', newSearchHandler);

app.post('/searches', searchResultsHandler);

app.get('*', notFoundHandler);


////////////////////
//// Handlers  ////
//////////////////

// http://localhost:7777/
function homeHandler (req,res){

  res.status(200).render('./pages/index');

}

// http://localhost:7777/searches/new
function newSearchHandler(req,res){

  res.status(200).render('./pages/searches/new');
}


// http://localhost:7777/searches

function searchResultsHandler (req,res){


  let searchKey= req.body.search_query;

  let searchedBy= req.body.search_by;

  let url = `https://www.googleapis.com/books/v1/volumes?q=+in${searchedBy}:${searchKey}`;


  superagent.get(url).then(booksData=>{

    let booksDataBody= booksData.body;

    let correctData= booksDataBody.items.map(e=>{
      return new Book(e);
    });


    res.status(200).render('./pages/searches/show', {book:correctData});



  }).catch(error => {
    res.send(error);
  });

}


function notFoundHandler(req, res) {

  res.status(404).render('./pages/error');
}

/////////////////////////
//// Constructor    ////
///////////////////////

function Book(data){

  this.title=data.volumeInfo.title;

  this.author=(data.volumeInfo.authors)? data.volumeInfo.authors: 'Unknown Book Authors';

  this.description= data.volumeInfo.description? data.volumeInfo.description:'Description is Unavailable' ;

  this.img=(data.volumeInfo.imageLinks)? data.volumeInfo.imageLinks.thumbnail: 'https://i.imgur.com/J5LVHEL.jpg';

  this.url= data.accessInfo.webReaderLink ? data.accessInfo.webReaderLink: 'Unavailable';
}





/////////////////////////////
//// Server Listening   ////
///////////////////////////

app.listen(PORT, ()=>{
  console.log('Listing on PORT:', PORT);
});
