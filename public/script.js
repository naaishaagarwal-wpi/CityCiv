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