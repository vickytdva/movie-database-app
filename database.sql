CREATE DATABASE IF NOT EXISTS movie_database;
USE movie_database;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  age INT,
  gender VARCHAR(20),
  country VARCHAR(100),
  continent VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150),
  description TEXT,
  release_year INT,
  genre VARCHAR(100),
  director VARCHAR(100),
  poster_url TEXT
);

CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT,
  user_id INT,
  rating INT
);

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT,
  user_id INT,
  comment_text TEXT
);

INSERT INTO users (id, username, age, gender, country, continent)
VALUES (1, 'Viktoria', 22, 'Female', 'Bulgaria', 'Europe')
ON DUPLICATE KEY UPDATE username = 'Viktoria';
INSERT INTO movies (title, description, release_year, genre, director, poster_url)
VALUES
('The Wolf of Wall Street', 'A movie about stockbroker life.', 2013, 'Drama', 'Martin Scorsese', 'https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_FMjpg_UX1000_.jpg'),
('Interstellar', 'Space and time exploration.', 2014, 'Sci-Fi', 'Christopher Nolan', 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX190_CR0,0,190,281_.jpg');