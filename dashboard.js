const API_URL = "https://blog-backend-3-eoll.onrender.com/api";
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if (!token) {
  alert("Please login first.");
  window.location.href = "login.html";
}

// Load user's posts
async function loadMyPosts() {
  const res = await fetch(`${API_URL}/posts`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const posts = await res.json();
  const container = document.getElementById("myPosts");

  // Filter posts by logged-in user
  const myPosts = posts.filter(p => p.author._id === userId);

  container.innerHTML = myPosts.map(p => `
    <div class="post" data-id="${p._id}">
      <h3>${p.title}</h3>
      <p>${p.content}</p>
      <button onclick="editPost('${p._id}')">Edit</button>
      <button onclick="deletePost('${p._id}')">Delete</button>
    </div>
  `).join("");
}

// Create new post
const postForm = document.getElementById("postForm");
postForm.addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

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
});

// Delete post
async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

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
}

// Edit post
async function editPost(postId) {
  const newTitle = prompt("Enter new title:");
  const newContent = prompt("Enter new content:");

  if (!newTitle || !newContent) return;

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
}

// Initial load
loadMyPosts();
