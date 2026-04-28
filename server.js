const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "viki123",
  database: "movie_database"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// LOGIN / REGISTER USER
app.post("/api/login", (req, res) => {
  const { username, age, gender, country, continent } = req.body;

  if (!username || !age || !gender || !country || !continent) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const checkSql = "SELECT * FROM users WHERE username = ?";

  db.query(checkSql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.json(results[0]);
    }

    const insertSql = `
      INSERT INTO users (username, age, gender, country, continent)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [username, age, gender, country, continent], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: result.insertId,
        username,
        age,
        gender,
        country,
        continent
      });
    });
  });
});

// GET MOVIES
app.get("/api/movies", (req, res) => {
  const sql = `
    SELECT 
      m.id,
      m.title,
      m.description,
      m.release_year,
      m.genre,
      m.director,
      m.poster_url,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating
    FROM movies m
    LEFT JOIN ratings r ON m.id = r.movie_id
    GROUP BY m.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// ADD MOVIE
app.post("/api/movies", (req, res) => {
  const { title, description, release_year, genre, director, poster_url } = req.body;

  const sql = `
    INSERT INTO movies 
    (title, description, release_year, genre, director, poster_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, description, release_year, genre, director, poster_url], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Movie added successfully" });
  });
});

// ADD OR UPDATE RATING
app.post("/api/ratings", (req, res) => {
  const { movie_id, user_id, rating } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User is not logged in." });
  }

  if (!rating || rating < 1 || rating > 10) {
    return res.status(400).json({ error: "Rating must be between 1 and 10." });
  }

  const checkSql = `
    SELECT * FROM ratings
    WHERE movie_id = ? AND user_id = ?
  `;

  db.query(checkSql, [movie_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      const updateSql = `
        UPDATE ratings
        SET rating = ?
        WHERE movie_id = ? AND user_id = ?
      `;

      db.query(updateSql, [rating, movie_id, user_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Rating updated" });
      });
    } else {
      const insertSql = `
        INSERT INTO ratings (movie_id, user_id, rating)
        VALUES (?, ?, ?)
      `;

      db.query(insertSql, [movie_id, user_id, rating], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Rating added" });
      });
    }
  });
});

// ADD COMMENT
app.post("/api/comments", (req, res) => {
  const { movie_id, user_id, comment_text } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User is not logged in." });
  }

  if (!comment_text) {
    return res.status(400).json({ error: "Comment cannot be empty." });
  }

  const sql = `
    INSERT INTO comments (movie_id, user_id, comment_text)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [movie_id, user_id, comment_text], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Comment added successfully" });
  });
});

// SHOW COMMENTS
app.get("/api/movies/:id/comments", (req, res) => {
  const sql = `
    SELECT c.comment_text, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.movie_id = ?
    ORDER BY c.id DESC
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// SHOW STATS WITH EACH USER
app.get("/api/movies/:id/fullstats", (req, res) => {
  const sql = `
    SELECT 
      u.username,
      r.rating,
      u.gender,
      u.country,
      u.continent,
      CASE 
        WHEN u.age < 18 THEN 'Under 18'
        WHEN u.age BETWEEN 18 AND 25 THEN '18-25'
        WHEN u.age BETWEEN 26 AND 40 THEN '26-40'
        ELSE '40+'
      END AS age_group
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.movie_id = ?
    ORDER BY r.rating DESC
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});