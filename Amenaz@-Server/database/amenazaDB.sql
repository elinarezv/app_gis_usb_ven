CREATE TABLE users (
	ID SERIAL PRIMARY KEY,
	firstName VARCHAR(30),
	lastName VARCHAR(30),
	address VARCHAR(150),
	email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(500),
	notifications BOOLEAN
);
