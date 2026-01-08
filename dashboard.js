const API_URL = "https://blog-backend-3-eoll.onrender.com/api"; // your backend
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if (!token) {
  alert("Please login first.");
  window.location.href = "login.html";
}

// Load posts by the logged-in user
async function loadMyPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const posts = await res.json();
    const container = document.getElementById("myPosts");

    // Filter posts by this user
    const myPosts = posts.filter(p => p.author._id === userId);

    container.innerHTML = myPosts.map(p => `
      <div class="post" data-id="${p._id}">
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <button onclick="editPost('${p._id}')">Edit</button>
        <button class="delete" onclick="deletePost('${p._id}')">Delete</button>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    alert("Failed to load posts.");
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

    if (res.ok) {
      alert("Post created!");
      postForm.reset();
      loadMyPosts();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error creating post.");
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

    if (res.ok) {
      alert("Post deleted!");
      loadMyPosts();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting post.");
  }
}

// Edit post
async function editPost(postId) {
  const newTitle = prompt("Enter new title:");
  const newContent = prompt("Enter new content:");

  if (!newTitle || !newContent) return;

  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle, content: newContent })
    });

    if (res.ok) {
      alert("Post updated!");
      loadMyPosts();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error updating post.");
  }
}

// Initial load
loadMyPosts();
