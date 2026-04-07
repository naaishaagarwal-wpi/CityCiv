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

const categoryFilter = document.getElementById("categoryFilter");
let currentFilter = "";

// listen for changes
if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    currentFilter = categoryFilter.value;
    getPosts();
  });
}

const sortFilter = document.getElementById("sortFilter");
let currentSort = "latest";

if (sortFilter) {
  sortFilter.addEventListener("change", () => {
    currentSort = sortFilter.value;
    getPosts();
  });
}

// GET POSTS
async function getPosts() {
  const container = document.getElementById("posts");
  if (!container) return;

  let query = supabase
    .from("posts")
    .select(`
      *,
      replies (*)
    `)

  // apply filter ONLY if selected
  if (currentFilter) {
    query = query.eq("category", currentFilter);
  }

  if (currentSort === "latest") {
    query = query.order("inserted_at", { ascending: false });
  }

  if (currentSort === "liked") {
    query = query.order("likes", { ascending: false });
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error(error);
    alert(error.message); 
    return;
  }

  // frontend sorting
  let sortedPosts = [...posts];

  // most replied
  if (currentSort === "replied") {
    sortedPosts.sort((a, b) => {
      return (b.replies?.length || 0) - (a.replies?.length || 0);
    });
  }

  // upcoming events
  if (currentSort === "events") {
    sortedPosts = sortedPosts
      .filter(p => {
        return (
          p.category === "event" &&
          p.event_date &&
          new Date(p.event_date) >= new Date()
        );
      })
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }

  container.innerHTML = "";

  sortedPosts.forEach(post => {
    const userLiked = post.likedBy?.includes(username);

    const div = document.createElement("div");
    div.className = "post-card";

    const repliesHTML = (post.replies || [])
      .map(reply => `<p class="reply">↳ ${reply.content}</p>`)
      .join("");

    div.innerHTML = `
      <div class="post-info">
        <strong>${post.username}</strong>
        <span class="post-category">${post.category || "General"}</span>
      </div>
      <p>${post.content}</p>
      <div class="replies">
        ${repliesHTML}
      </div>
      ${
        post.category === "event"
          ? `
          <div>
            <p class="event-info">📅 ${post.event_date || ""}</p>
            <p class="event-info">⏰ ${post.event_time || ""}</p>
            <p class="event-info">📍 ${post.event_location || ""}</p>
          </div>
        `
          : ""
      }
      ${post.image_url ? `<img src="${post.image_url}" width="200"/>` : ""}
      <div class="post-footer">
        <p class="post-likes"><span id="like-${post.id}">${post.likes || 0}</span></p>
        <button class = "post-heart none" data-id="${post.id}">
          ${userLiked ? "❤️" : "🤍"}
        </button>
      </div>

      <input type="text" placeholder="Write a reply..." id="reply-input-${post.id}" />
      <button onclick="addReply('${post.id}')">Reply</button>
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
  console.log("🟡 likePost called for postId:", postId, "username:", username);

  // Fetch the post with likedBy array and current likes count
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("likedBy, likes")
    .eq("id", postId)
    .single();

  if (fetchError) {
    console.error("❌ Error fetching post for like:", fetchError);
    return;
  }

  if (!post) {
    console.warn("⚠️ No post found with id:", postId);
    return;
  }

  console.log("📌 Post data fetched:", post);

  // Copy current array & like count
  let likedBy = post.likedBy || [];
  let likes = post.likes || 0;

  console.log("📊 Previous likedBy:", likedBy);
  console.log("📊 Previous likes:", likes);

  // If user has already liked
  if (likedBy.includes(username)) {
    console.log("🔁 User already liked — removing like");

    // Remove user and decrease count
    likedBy = likedBy.filter(u => u !== username);
    likes = Math.max(0, likes - 1);
  } else {
    console.log("➕ User has not liked — adding like");

    likedBy.push(username);
    likes++;
  }

  console.log("📊 New likedBy:", likedBy);
  console.log("📊 New likes:", likes);

  // Update the row in your posts table
  const { error: updateError } = await supabase
    .from("posts")
    .update({ likedBy, likes })
    .eq("id", postId);

  if (updateError) {
    console.error("❌ Error updating like:", updateError);
    return;
  }

  console.log("✅ Like update successful for postId:", postId);

  // Refresh the feed
  getPosts();
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

const categoryInput = document.getElementById("categoryInput");
const eventFields = document.getElementById("eventFields");
if (categoryInput && eventFields) {
  const toggleEventFields = () => {
    if (categoryInput.value === "event") {
      eventFields.style.display = "block";
    } else {
      eventFields.style.display = "none";
    }
  };

  categoryInput.addEventListener("change", toggleEventFields);

  // run once on load
  toggleEventFields();
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
  const eventDate = document.getElementById("eventDate")?.value;
  const eventTime = document.getElementById("eventTime")?.value;
  const eventLocation = document.getElementById("eventLocation")?.value;

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
  
      event_date: category === "event" && eventDate ? eventDate : null,
      event_time: category === "event" && eventTime ? eventTime : null,
      event_location: category === "event" && eventLocation ? eventLocation : null,
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

window.addReply = async function(postId) {
  const input = document.getElementById(`reply-input-${postId}`);
  const content = input.value;

  if (!content) return;

  const { error } = await supabase.from("replies").insert({
    post_id: postId,
    content,
    username // optional if you store it
  });

  if (error) {
    console.error(error);
    return;
  }

  input.value = "";
  getPosts(); // refresh
}

/* =========================
   NAV
========================= */

const signOutBtn = document.getElementById("signOutBtn");

if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
      alert("Sign out failed: " + error.message);
      return;
    }

    // Redirect to login page
    window.location.href = "/";
  });
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    window.location.href = "/";
  }
});

window.goHome = () => {
  window.location = "/home.html";
};

/* =========================
   INIT
========================= */

if (window.location.pathname.includes("feed")) {
  loadUser().then(getPosts);
}