'use strict';

const icon = document.querySelector( '.icon' );
const nav = document.querySelector( 'nav' );

icon.addEventListener( 'click', () => {
  icon.classList.toggle( 'close' );
  nav.classList.toggle( 'show' );
} );

function CommentSection( name, comment ) {
  this.name = name;
  this.comment = comment;
  CommentSection.arr.push( this );
}
CommentSection.arr = [];
// Dynamic Contact Us

const touchButton = document.querySelector( '.float-text' );
const card = document.querySelector( '.float-card-info' );
const close1 = document.querySelector( '.fa-times' );

touchButton.addEventListener( 'click', moveCard );
close1.addEventListener( 'click', removeCard );

let y;
function moveCard( evt ) {
  y = evt.target;

  y.parentElement.nextElementSibling.style.display = 'block';
  console.log( 'this is y', y );
  card.classList.toggle( 'active' );

}

let x;
function removeCard( event ) {

  x = event.target;
  console.log( x );
  x.parentElement.style.display = 'none';


}