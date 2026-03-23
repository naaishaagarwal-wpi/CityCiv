const username = localStorage.getItem("username")

if (!username) {
  window.location = "/"
}

document.getElementById("nameDisplay").textContent = username

async function getPosts() {
  const res = await fetch("/posts")
  const posts = await res.json()

  const container = document.getElementById("posts")
  container.innerHTML = ""

  posts.forEach(post => {
    const div = document.createElement("div")
    div.innerHTML = `
      <b>${post.username}</b>: ${post.content}
      <div>Likes: ${post.likes} 
        <button onclick="likePost(${post.id})">❤️ Like</button>
      </div>
      <hr>
    `
    container.appendChild(div)
  })
}

async function addPost() {
  const content = document.getElementById("postInput").value
  if (!content) return

  await fetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, content }),
  })

  document.getElementById("postInput").value = ""
  getPosts()
}

async function likePost(postId) {
  await fetch(`/posts/${postId}/like`, {
    method: "POST"
  })
  getPosts()
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