const username = localStorage.getItem("username")

if (!username) {
  window.location = "/"
}

document.getElementById("nameDisplay").textContent = username

async function getPosts() {
  const res = await fetch("/posts");
  const posts = await res.json();

  const container = document.getElementById("posts");
  container.innerHTML = "";

  posts.forEach(post => {
    // Ensure likedBy exists
    if (!post.likedBy) post.likedBy = [];

    const userLiked = post.likedBy.includes(username);

    const div = document.createElement("div");
    div.className = "post-card";
    div.innerHTML = `
      <div class="post-header">
        <strong>${post.username || "Unknown"}</strong>
        <span class="post-category">${post.category || "General"}</span>
      </div>
      <p class="post-content">${post.content || ""}</p>
      ${post.image ? `<img class="post-image" src="/uploads/${post.image}" alt="Post image" />` : ""}
      <div class="post-footer">
        <span>Likes: <span id="like-count-${post.id}">${post.likes || 0}</span></span>
        <button id="like-btn-${post.id}" onclick="likePost(${post.id})">
          ${userLiked ? "❤️" : "🤍"}
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

async function likePost(postId) {
  try {
    const res = await fetch(`/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    if (!res.ok) throw new Error("Failed to toggle like");

    const updatedPost = await res.json();

    // update UI
    document.getElementById(`like-count-${postId}`).textContent = updatedPost.likes;
    document.getElementById(`like-btn-${postId}`).textContent = updatedPost.likedBy.includes(username) ? "❤️" : "🤍";

  } catch (err) {
    console.error(err);
  }
}

function signOut() {
  localStorage.removeItem("username")
  window.location = "/"
}

function goHome() {
  window.location = "/home.html"
}

getPosts()

function openModal() {
  document.getElementById("postModal").style.display = "block"
}

function closeModal() {
  document.getElementById("postModal").style.display = "none"
}

async function submitPost() {
  const content = document.getElementById("modalPostInput").value
  const category = document.getElementById("categoryInput").value
  const imageFile = document.getElementById("imageInput").files[0]
  const username = localStorage.getItem("username")

  if (!content) {
    alert("Post cannot be empty")
    return
  }

  const formData = new FormData()
  formData.append("username", username)
  formData.append("content", content)
  formData.append("category", category)

  if (imageFile) {
    formData.append("image", imageFile)
  }

  try {
    const res = await fetch("/posts", {
      method: "POST",
      body: formData
    })

    console.log("POST status:", res.status)

    if (!res.ok) {
      const text = await res.text()
      console.error("Server error:", text)
      alert("Post failed. Check console.")
      return
    }

    // reset
    document.getElementById("modalPostInput").value = ""
    document.getElementById("imageInput").value = ""
    closeModal()

    getPosts()

  } catch (err) {
    console.error("Fetch error:", err)
    alert("Network error")
  }
}