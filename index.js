const express = require("express")
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const app = express()
const PORT = 3000

const upload = multer({ dest: path.join(__dirname, "uploads") })

app.use(express.json())
app.use(express.static("public"))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

function readData() {
  const raw = fs.readFileSync(path.join(__dirname, "data.json"))
  return JSON.parse(raw)
}

function writeData(data) {
  fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(data, null, 2))
}

// Save or get user
app.post("/user", (req, res) => {
  const { name } = req.body
  const db = readData()

  if (!db.users.includes(name)) {
    db.users.push(name)
    writeData(db)
  }

  res.json({ success: true })
})

// Get posts
app.get("/posts", (req, res) => {
  const db = readData()
  db.posts.forEach(p => {
    if (!p.likedBy) p.likedBy = [];
  });
  res.json(db.posts)
})

// Create a new post
app.post("/posts", upload.single("image"), (req, res) => {
  const db = readData()
  const { username, content, category } = req.body

  if (!username || !content) {
    return res.status(400).json({ error: "username and content are required" })
  }

  const newPost = {
    id: db.posts.length + 1,
    username,
    content,
    category,
    likes: 0,
    likedBy: [],
    comments: []
  };

  if (req.file) {
    newPost.image = req.file.filename
  }

  db.posts.unshift(newPost)
  writeData(db)

  res.json(newPost)
})

// Like a post
app.post("/posts/:id/like", (req, res) => {
  const { username } = req.body;
  const db = readData();
  const post = db.posts.find(p => p.id === parseInt(req.params.id));

  if (!post) return res.status(404).json({ error: "Post not found" });

  // Ensure likedBy exists
  if (!post.likedBy) post.likedBy = [];

  if (post.likedBy.includes(username)) {
    // unlike
    post.likedBy = post.likedBy.filter(u => u !== username);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // like
    post.likedBy.push(username);
    post.likes += 1;
  }

  writeData(db);
  res.json(post);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})