const API = "http://localhost:3000/api";

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "login.html";
}

let currentUserId = currentUser.id;

document.addEventListener("DOMContentLoaded", () => {
  const loggedUser = document.getElementById("loggedUser");

  loggedUser.innerText =
    `Logged as: ${currentUser.username} | ${currentUser.age} | ${currentUser.gender} | ${currentUser.country}, ${currentUser.continent}`;

  getMovies();
});

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

async function getMovies() {
  const res = await fetch(`${API}/movies`);
  const movies = await res.json();

  const container = document.getElementById("movies");
  container.innerHTML = "";

  movies.forEach(movie => {
    const div = document.createElement("div");
    div.className = "movie";

    div.innerHTML = `
      <div>
        <img src="${movie.poster_url}" alt="${movie.title}">
      </div>

      <div>
        <h3>${movie.title}</h3>
        <p>${movie.description || "No description added."}</p>

        <span class="badge">📅 ${movie.release_year || "N/A"}</span>
        <span class="badge">🎭 ${movie.genre || "N/A"}</span>
        <span class="badge">🎬 ${movie.director || "N/A"}</span>

        <p class="rating">
          Average Rating:
          <span>${movie.avg_rating == 0 ? "No rating" : movie.avg_rating + " / 10"}</span>
        </p>

        <div id="stats-${movie.id}" class="stats-box"></div>
        <div id="comments-${movie.id}" class="stats-box"></div>
      </div>

      <div class="actions">
        <label><strong>Rate this movie:</strong></label>
        <input id="rate-${movie.id}" type="number" min="1" max="10" placeholder="Rating 1-10">
        <button onclick="rate(${movie.id})">Rate</button>

        <label><strong>Your comment:</strong></label>
        <input id="com-${movie.id}" placeholder="Write comment...">
        <button class="comment-btn" onclick="comment(${movie.id})">Comment</button>

        <button onclick="stats(${movie.id})">Show Stats</button>
        <button onclick="comments(${movie.id})">Show Comments</button>
      </div>
    `;

    container.appendChild(div);
  });
}

async function addMovie() {
  const movie = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    release_year: document.getElementById("year").value,
    genre: document.getElementById("genre").value,
    director: document.getElementById("director").value,
    poster_url: document.getElementById("poster").value
  };

  if (!movie.title || !movie.genre || !movie.director) {
    alert("Please add at least title, genre and director.");
    return;
  }

  await fetch(`${API}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie)
  });

  alert("Movie added!");
  getMovies();
}

async function rate(id) {
  const value = document.getElementById(`rate-${id}`).value;

  if (!value) {
    alert("Enter rating.");
    return;
  }

  if (value < 1 || value > 10) {
    alert("Rating must be between 1 and 10.");
    return;
  }

  const res = await fetch(`${API}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      movie_id: id,
      user_id: currentUserId,
      rating: Number(value)
    })
  });

  if (!res.ok) {
    alert("Error saving rating.");
    return;
  }

  await getMovies();
}

async function comment(id) {
  const text = document.getElementById(`com-${id}`).value;

  if (!text) {
    alert("Write comment.");
    return;
  }

  const res = await fetch(`${API}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      movie_id: id,
      user_id: currentUserId,
      comment_text: text
    })
  });

  if (!res.ok) {
    alert("Error saving comment.");
    return;
  }

  alert("Comment added!");
  document.getElementById(`com-${id}`).value = "";
}

async function comments(id) {
  const res = await fetch(`${API}/movies/${id}/comments`);
  const data = await res.json();

  const div = document.getElementById(`comments-${id}`);
  div.innerHTML = "<h4>Comments:</h4>";

  if (data.length === 0) {
    div.innerHTML += "<p>No comments yet.</p>";
    return;
  }

  data.forEach(comment => {
    div.innerHTML += `<p><strong>${comment.username}:</strong> ${comment.comment_text}</p>`;
  });
}

async function stats(id) {
  const res = await fetch(`${API}/movies/${id}/fullstats`);
  const data = await res.json();

  const div = document.getElementById(`stats-${id}`);
  div.innerHTML = "<h4>User Ratings:</h4>";

  if (data.length === 0) {
    div.innerHTML += "<p>No ratings yet.</p>";
    return;
  }

  data.forEach(stat => {
    div.innerHTML += `
      <p>
        👤 <strong>${stat.username}</strong> → ⭐ ${stat.rating} |
        ${stat.gender} | ${stat.age_group} | ${stat.country}, ${stat.continent}
      </p>
    `;
  });
}