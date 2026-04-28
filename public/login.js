const API = "http://localhost:3000/api";

async function login() {
  const user = {
    username: document.getElementById("username").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    country: document.getElementById("country").value,
    continent: document.getElementById("continent").value
  };

  if (!user.username || !user.age || !user.gender || !user.country || !user.continent) {
    alert("Please fill all fields.");
    return;
  }

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });

  const data = await res.json();

  localStorage.setItem("currentUser", JSON.stringify(data));

  window.location.href = "index.html";
}