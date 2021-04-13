DROP TABLE IF EXISTS books;
create table books (
    id SERIAL primary key not null,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn VARCHAR(255),
    img VARCHAR(255),
    url VARCHAR(255),
    description TEXT,
    offShelf VARCHAR(255)
);
