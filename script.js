const API_URL = "https://blog-backend-3-eoll.onrender.com/api"; // your Render backend

// --------------------------------------
// Public posts on index.html
// --------------------------------------
async function loadPosts() {
  const container = document.getElementById("posts");
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();
    container.innerHTML = posts.map(p => `
      <div class="post">
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <small>By ${p.author.name}</small>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>Failed to load posts</p>";
    console.error(err);
  }
}
loadPosts();

// --------------------------------------
// Signup
// --------------------------------------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful!");
        window.location.href = "login.html";
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  });
}

// --------------------------------------
// Login
// --------------------------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
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
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  });
}

// --------------------------------------
// Dashboard
// --------------------------------------
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if (window.location.href.includes("dashboard.html")) {
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
  }

  const postForm = document.getElementById("postForm");
  const myPostsContainer = document.getElementById("myPosts");

  // Load user's posts
  async function loadMyPosts() {
  try {
    const res = await fetchWithToken(`${API_URL}/posts`);
    const posts = await res.json();
    const myPosts = posts.filter(p => p.author._id === userId);

    myPostsContainer.innerHTML = myPosts.map(p => `
      <div class="post-card" data-id="${p._id}">
        <h3>${p.title}</h3>
        <small>By ${p.author.name}</small>
        <p>${p.content}</p>
        <input class="edit-title" value="${p.title}" placeholder="Edit title" />
        <textarea class="edit-content" rows="3">${p.content}</textarea>
        <div>
          <button onclick="savePost('${p._id}')">Save</button>
          <button onclick="deletePost('${p._id}')" style="background:#c0392b;color:#fff;">Delete</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
    myPostsContainer.innerHTML = "<p>Failed to load posts</p>";
  }
}



  // Create post
  postForm.addEventListener("submit", async e => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) throw await res.json();
      postForm.reset();
      loadMyPosts();
    } catch (err) {
      console.error(err);
      alert(err.error || "Failed to create post");
    }
  });

  // Delete post
  window.deletePost = async function(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw await res.json();
      loadMyPosts();
    } catch (err) {
      console.error(err);
      alert(err.error || "Failed to delete post");
    }
  }

  // Save post (edit)
  window.savePost = async function(postId) {
    const container = document.querySelector(`.post[data-id="${postId}"]`);
    const title = container.querySelector(".edit-title").value;
    const content = container.querySelector(".edit-content").value;

    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) throw await res.json();
      loadMyPosts();
    } catch (err) {
      console.error(err);
      alert(err.error || "Failed to update post");
    }
  }
}
