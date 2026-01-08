const API_URL = "https://blog-backend-3-eoll.onrender.com/api";

// Load all posts
async function loadPosts() {
  const res = await fetch(`${API_URL}/posts`);
  const posts = await res.json();
  const container = document.getElementById("posts");
  if (!container) return;
  container.innerHTML = posts.map(p => `
    <div class="post">
      <h2>${p.title}</h2>
      <p>${p.content}</p>
      <small>By ${p.author.name}</small>
    </div>
  `).join("");
}
loadPosts();

// Signup form
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    alert(data.message || data.error);
    if (res.ok) window.location.href = "login.html";
  });
}

// Login form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "dashboard.html";
    } else {
      alert(data.error);
    }
  });
}

// Dashboard create post
const postForm = document.getElementById("postForm");
if (postForm) {
  postForm.addEventListener("submit", async e => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ title, content })
    });
    if (res.ok) {
      alert("Post created");
      postForm.reset();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  });
}
