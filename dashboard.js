const API_URL = "https://blog-backend-3-eoll.onrender.com/api"; // Render backend
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if (!token) {
  alert("Please login first.");
  window.location.href = "login.html";
}

// Load posts by logged-in user
async function loadMyPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch posts");

    const posts = await res.json();
    const container = document.getElementById("myPosts");

    const myPosts = posts.filter(p => p.author._id.toString() === userId);

    container.innerHTML = myPosts.map(p => `
      <div class="post" data-id="${p._id}">
        <input class="edit-title" value="${p.title}" />
        <textarea class="edit-content">${p.content}</textarea>
        <button onclick="savePost('${p._id}')">Save</button>
        <button onclick="deletePost('${p._id}')">Delete</button>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    alert("Error loading posts");
  }
}

// Create new post
const postForm = document.getElementById("postForm");
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

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create post");
    }

    postForm.reset();
    loadMyPosts();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

// Delete post
async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete post");
    }

    loadMyPosts();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Save post (inline edit)
async function savePost(postId) {
  const container = document.querySelector(`.post[data-id="${postId}"]`);
  const title = container.querySelector(".edit-title").value;
  const content = container.querySelector(".edit-content").value;

  if (!title || !content) return alert("Title and content required");

  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update post");
    }

    loadMyPosts();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Initial load
loadMyPosts();
