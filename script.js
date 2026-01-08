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

// Function to always get latest token
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

// Dashboard functionality
if (window.location.href.includes("dashboard.html")) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
  }

  const postForm = document.getElementById("postForm");
  const myPostsContainer = document.getElementById("myPosts");

  // Load user posts
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
      alert(err.error || "Failed to load posts");
    }
  }

  loadMyPosts();

  // Create post
  postForm.addEventListener("submit", async e => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

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

  // Delete post
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

  // Save post (edit)
  window.savePost = async function(postId) {
    const container = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (!container) return;
    const title = container.querySelector(".edit-title").value;
    const content = container.querySelector(".edit-content").value;

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
