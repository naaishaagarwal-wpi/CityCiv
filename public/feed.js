import { supabase } from "./supabaseClient.js";

let userId = null;
let username = null;
const MAX_LENGTH = 150;

//all supabase code was referenced from supabase api docs such as: https://supabase.com/docs/reference/javascript/auth-signinanonymously
// Load user
async function loadUser() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location = "/";
    return;
  }

  userId = session.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  username = data?.username || "username";
  document.getElementById("nameDisplay").textContent = username;
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

//sorting functionality
const sortFilter = document.getElementById("sortFilter");
let currentSort = "latest";

if (sortFilter) {
  sortFilter.addEventListener("change", () => {
    currentSort = sortFilter.value;
    getPosts();
  });
}

const searchInput = document.getElementById("searchInput");
let currentSearch = "";

if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value;
    getPosts();
  });
}

// get posts
async function getPosts() {
  const container = document.getElementById("posts");
  if (!container) return;

  //https://supabase.com/docs/reference/javascript/textsearch
  let query = supabase
  .from("posts")
  .select(`
    *,
    replies (*),
    likes (user_id),
    saved_posts (user_id)
  `);

  if (currentFilter === "mine") {
    query = query.eq("user_id", userId);
  
  } else if (currentFilter === "saved") {
    query = supabase
      .from("posts")
      .select(`
        *,
        replies (*),
        likes (user_id),
        saved_posts!inner (user_id)
      `)
      .eq("saved_posts.user_id", userId);
  
  } else if (currentFilter) {
    query = query.eq("category", currentFilter);
  }

  // search filter
  if (currentSearch) {
    query = query.ilike("content", `%${currentSearch}%`);
  }

  // sorting
  if (currentSort === "latest") {
    query = query.order("inserted_at", { ascending: false });
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error(error);
    alert(error.message); 
    return;
  }

  // frontend sorting
  let sortedPosts = [...posts];

  if (currentSort === "liked") {
    sortedPosts.sort((a, b) =>
      (b.likes?.length || 0) - (a.likes?.length || 0)
    );
  }

  // most replied
  if (currentSort === "replied") {
    sortedPosts.sort((a, b) => {
      return (b.replies?.length || 0) - (a.replies?.length || 0);
    });
  }

  //this creates the div for each post
  //https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting
  container.innerHTML = "";

  sortedPosts.forEach(post => {

    const userLiked = post.likes?.some(like => like.user_id === userId);

    const userSaved = post.saved_posts?.some(
      save => save.user_id === userId
    );

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
      <p class="post-content" id="content-${post.id}">
        ${post.content.length > MAX_LENGTH 
          ? post.content.slice(0, MAX_LENGTH) + "..." 
          : post.content}
      </p>

      ${
        post.content.length > MAX_LENGTH
          ? `<button class="read-more-btn" data-id="${post.id}">Read more</button>`
          : ""
      }
      <div class="replies">
        ${repliesHTML}
      </div>
      ${
        post.category === "Events"
          ? `
          <div class="event-details">
            <p class="event-info">📅 ${post.event_date || ""}</p>
            <p class="event-info">⏰ ${post.event_time || ""}</p>
            <p class="event-info">📍 ${post.event_location || ""}</p>
          </div>
        `
          : ""
      }
      ${post.image_url ? `<img src="${post.image_url}" width="200"/>` : ""}
      <div class="post-footer">
        <div class="reply-section">
          <input class="reply-input" type="text" placeholder="Write a reply..." id="reply-input-${post.id}" />
          <button class="reply-button" onclick="addReply('${post.id}')">Reply</button>
        </div>
        <div class="like-section">
          <p class="post-likes"><span id="like-${post.id}">${post.likes?.length || 0}</span></p>
          <button class = "post-heart none" data-id="${post.id}">
            ${userLiked ? "❤️" : "🤍"}
          </button>
        </div>
        <div class="save-section">
          <button class="post-save reply-button" data-id="${post.id}">
            ${userSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    `;

    const readMoreBtn = div.querySelector(".read-more-btn");

    if (readMoreBtn) {
      let expanded = false;

      readMoreBtn.addEventListener("click", () => {
        const contentEl = div.querySelector(`#content-${post.id}`);

        if (!expanded) {
          contentEl.textContent = post.content;
          readMoreBtn.textContent = "Show less";
        } else {
          contentEl.textContent = post.content.slice(0, MAX_LENGTH) + "...";
          readMoreBtn.textContent = "Read more";
        }

        expanded = !expanded;
      });
    }

    // Like button event
    div.querySelector(".post-heart").addEventListener("click", () => {
      likePost(post.id);
    });

    div.querySelector(".post-save").addEventListener("click", () => {
      savePost(post.id);
    });

    container.appendChild(div);
  });
}

async function savePost(postId) {
  const { data: existing } = await supabase
    .from("saved_posts")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    // UNSAVE
    await supabase
      .from("saved_posts")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
  } else {
    // SAVE
    const { error } = await supabase
      .from("saved_posts")
      .insert({
        user_id: userId,
        post_id: postId
      });

    if (error) {
      console.error(error);
    }
  }

  getPosts();
}

async function likePost(postId) {
  const { data: existing } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle(); // FIXED

  if (existing) {
    // UNLIKE
    await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
  } else {
    // LIKE
    const { error } = await supabase
      .from("likes")
      .insert({
        user_id: userId,
        post_id: postId
      });

    if (error) {
      console.error(error); // good debugging
    }
  }

  getPosts();
}

//this is the function for the modal that creates the pop up when pressing create post button

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
    if (categoryInput.value === "Events") {
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
      user_id: userId,
      username: username,
      content,
      category,
      image_url,
      event_date: category === "Events" ? eventDate : null,
      event_time: category === "Events" ? eventTime : null,
      event_location: category === "Events" ? eventLocation : null,
    }
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

  await supabase.from("replies").insert({
    post_id: postId,
    user_id: userId,
    content
  });

  if (error) {
    console.error(error);
    return;
  }

  input.value = "";
  getPosts(); // refresh
}

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

if (window.location.pathname.includes("feed")) {
  loadUser().then(getPosts);
}