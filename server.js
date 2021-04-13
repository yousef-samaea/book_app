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

//PG
const pg = require('pg');


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

// pg client
//const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });




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

app.post('/books', favBooksHandler);

app.get('/books/:id', singleBookHandler);

app.get('*', notFoundHandler);




////////////////////
//// Handlers  ////
//////////////////

// http://localhost:7777/
function homeHandler (req,res){

  const SQL = `SELECT * FROM books;`;
  client.query(SQL).then(data=>{
    res.render('pages/index', {books:data.rows, count:data.rows.length});
  });

  // res.status(200).render('./pages/index');

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




// http://localhost:7777/books
function favBooksHandler (req,res){

  let id;

  let SQL = 'INSERT INTO books (title, author, isbn, img , url ,description, offShelf) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id;';

  const { title, author, isbn, img , url , description,offShelf } = req.body;

  const safeValues=[title, author, isbn, img , url ,description, offShelf];

  const sqlSearch = `SELECT * FROM books WHERE isbn = '${isbn}' ;`;

  client.query(sqlSearch).then((searchedResult) => {
    if (searchedResult.rowCount > 0) {
      res.redirect(`/books/${searchedResult.rows[0].id}`);
    }
    else{
      client.query(SQL,safeValues)
        .then ((result) => {
          id =result.rows[0].id ;
          res.redirect(`/books/${id}`);
        });
    }
  });

}


// Single Book Details
function singleBookHandler(req,res){

  const SQL = `SELECT * from books WHERE id=${req.params.id};`;
  client.query(SQL)
    .then(result => {

      res.render('pages/books/show', { books: result.rows[0]});
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

  this.isbn= data.volumeInfo.industryIdentifiers? `${data.volumeInfo.industryIdentifiers[0].type}: ${data.volumeInfo.industryIdentifiers[0].identifier}` : 'Unknown ISBN';

  this.img=(data.volumeInfo.imageLinks)? data.volumeInfo.imageLinks.thumbnail: 'https://i.imgur.com/J5LVHEL.jpg';

  this.url= data.accessInfo.webReaderLink ? data.accessInfo.webReaderLink: 'Unavailable';

  this.description= data.volumeInfo.description? data.volumeInfo.description:'Description is Unavailable' ;

  this.offShelf=data.volumeInfo.categories ? data.volumeInfo.categories: 'Unavailable Data';

}





/////////////////////////////
//// Server Listening   ////
///////////////////////////

// app.listen(PORT, ()=>{
//   console.log('Listing on PORT:', PORT);
// });

client.connect()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`listening on ${PORT}`)
    );
  });
