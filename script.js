const API_URL = "https://blog-backend-3-eoll.onrender.com/api";

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
  });
}

// Fetch helper with token
async function fetchWithToken(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw { error: "No token found. Please login again." };

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}

// ------------------- Public Posts -------------------
async function loadPosts() {
  const container = document.getElementById("posts");
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:#666;">No posts yet.</p>`;
      return;
    }

    container.innerHTML = posts.map(p => `
      <div class="post-card">
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <small>By ${p.author.name}</small>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='text-align:center; color:red;'>Failed to load posts</p>";
  }
}
loadPosts();

// ------------------- Signup -------------------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
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
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  });
}

// ------------------- Login -------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
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
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  });
}

// ------------------- Dashboard -------------------
if (window.location.href.includes("dashboard.html")) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
  }

  const postForm = document.getElementById("postForm");
  const myPostsContainer = document.getElementById("myPosts");

  async function loadMyPosts() {
    try {
      const posts = await fetchWithToken(`${API_URL}/posts`);
      const myPosts = posts.filter(p => p.author._id === userId);

      if (myPosts.length === 0) {
        myPostsContainer.innerHTML = `<p style="text-align:center; color:#666;">No posts yet. Create your first post above!</p>`;
        return;
      }

      myPostsContainer.innerHTML = myPosts.map(p => `
        <div class="post-card" data-id="${p._id}">
          <input class="edit-title" value="${p.title}" placeholder="Title" />
          <textarea class="edit-content" rows="4" placeholder="Content">${p.content}</textarea>
          <div class="post-actions">
            <button class="btn-save" onclick="savePost('${p._id}')">Save</button>
            <button class="btn-delete" onclick="deletePost('${p._id}')">Delete</button>
          </div>
        </div>
      `).join("");
    } catch (err) {
      console.error(err);
      myPostsContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to load posts</p>`;
    }
  }

  loadMyPosts();

  postForm.addEventListener("submit", async e => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !content) return alert("Title and content cannot be empty.");

    try {
      await fetchWithToken(`${API_URL}/posts`, {
        method: "POST",
        body: JSON.stringify({ title, content })
      });
      postForm.reset();
      loadMyPosts();
    } catch (err) {
      console.error(err);
      alert(err.error || "Failed to create post");
    }
  });

  window.deletePost = async function(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetchWithToken(`${API_URL}/posts/${postId}`, { method: "DELETE" });
      loadMyPosts();
    } catch (err) {
      console.error(err);
      alert(err.error || "Failed to delete post");
    }
  }

  window.savePost = async function(postId) {
    const container = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (!container) return;
    const title = container.querySelector(".edit-title").value.trim();
    const content = container.querySelector(".edit-content").value.trim();
    if (!title || !content) return alert("Title and content cannot be empty.");

    try {
      await fetchWithToken(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ title, content })
      });
      loadMyPosts();
    } catch (err) {
      console.error(err);
      alert(err.error || "Failed to update post");
    }
  }
}
