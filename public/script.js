import { supabase } from "./supabaseClient.js";

/* =========================
   AUTH SECTION (LOGIN PAGE)
========================= */

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

// SIGN UP
const signupBtn = document.getElementById("signup");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const { data, error } = await supabase.auth.signUp({
      email: emailInput.value,
      password: passwordInput.value,
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    message.textContent = error ? error.message : "Check your email!";
  });
}

// LOGIN
const loginBtn = document.getElementById("login");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.value,
      password: passwordInput.value,
    });

    if (error) {
      message.textContent = error.message;
    } else {
      window.location.href = "/feed.html";
    }
  });
}

// GOOGLE LOGIN
const googleBtn = document.getElementById("google");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) message.textContent = error.message;
  });
}

// AUTO REDIRECT (only on login page)
if (window.location.pathname === "/" || window.location.pathname.includes("index")) {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) window.location.href = "/feed.html";
}

/* =========================
   FEED SECTION
========================= */

let username = null;

// Load user
async function loadUser() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location = "/";
    return;
  }

  username = session.user.email;

  const nameDisplay = document.getElementById("nameDisplay");
  if (nameDisplay) nameDisplay.textContent = username;

  console.log("User:", username);
}

// GET POSTS
async function getPosts() {
  const container = document.getElementById("posts");
  if (!container) return;

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  container.innerHTML = "";

  posts.forEach(post => {
    const userLiked = post.likedBy?.includes(username);

    const div = document.createElement("div");
    div.className = "post-card";

    div.innerHTML = `
      <strong>${post.username}</strong>
      <p>${post.content}</p>
      ${post.image_url ? `<img src="${post.image_url}" width="200"/>` : ""}
      <p>Likes: <span id="like-${post.id}">${post.likes || 0}</span></p>
      <button data-id="${post.id}">
        ${userLiked ? "❤️" : "🤍"}
      </button>
    `;

    // Like button event
    div.querySelector("button").addEventListener("click", () => {
      likePost(post.id);
    });

    container.appendChild(div);
  });
}

// LIKE POST
async function likePost(postId) {
  const { data: post } = await supabase
    .from("posts")
    .select("likedBy, likes")
    .eq("id", postId)
    .single();

  let likedBy = post.likedBy || [];
  let likes = post.likes || 0;

  if (likedBy.includes(username)) {
    likedBy = likedBy.filter(u => u !== username);
    likes--;
  } else {
    likedBy.push(username);
    likes++;
  }

  await supabase
    .from("posts")
    .update({ likedBy, likes })
    .eq("id", postId);

  getPosts(); // refresh
}

/* =========================
   MODAL
========================= */

const openBtn = document.getElementById("openPostBtn");
const modal = document.getElementById("postModal");

if (openBtn) {
  openBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });
}

const closeBtn = document.getElementById("closeModalBtn");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

/* =========================
   CREATE POST
========================= */

const submitBtn = document.getElementById("submitPostBtn");

if (submitBtn) {
  submitBtn.addEventListener("click", submitPost);
}

async function submitPost() {
  const content = document.getElementById("modalPostInput").value;
  const category = document.getElementById("categoryInput").value;
  const imageFile = document.getElementById("imageInput").files[0];

  if (!content) return alert("Post cannot be empty");

  let image_url = null;

  if (imageFile) {
    const { data, error } = await supabase.storage
      .from("images")
      .upload(`public/${Date.now()}-${imageFile.name}`, imageFile);

    if (error) {
      console.error(error);
      return;
    }

    image_url = supabase
      .storage
      .from("images")
      .getPublicUrl(data.path).data.publicUrl;
  }

  const { error } = await supabase.from("posts").insert([
    {
      username,
      content,
      category,
      likes: 0,
      likedBy: [],
      image_url,
    },
  ]);

  if (error) {
    console.error(error);
    alert("Post failed");
    return;
  }

  modal.style.display = "none";
  getPosts();
}

/* =========================
   NAV
========================= */

window.signOut = async () => {
  await supabase.auth.signOut();
  window.location = "/";
};

window.goHome = () => {
  window.location = "/home.html";
};

/* =========================
   INIT
========================= */

if (window.location.pathname.includes("feed")) {
  loadUser().then(getPosts);
}