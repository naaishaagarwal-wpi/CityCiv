import { supabase } from "./supabaseClient.js";

let userId = null;

/* =========================
   LOAD USER + PROFILE
========================= */
async function loadAccount() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location = "/";
    return;
  }

  userId = session.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error loading profile:", error);
    return;
  }

  // Populate inputs
  const usernameInput = document.getElementById("username");
  const fullNameInput = document.getElementById("full_name");

  if (usernameInput) usernameInput.value = data.username || "";
  if (fullNameInput) fullNameInput.value = data.full_name || "";
}

/* =========================
   SAVE PROFILE UPDATES
========================= */
async function save() {
  const username = document.getElementById("username").value;
  const full_name = document.getElementById("full_name").value;

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      full_name
    })
    .eq("id", userId);

  if (error) {
    console.error("Update error:", error);
    alert("Failed to update profile");
    return;
  }

  alert("Profile updated successfully!");
}

/* =========================
   EDIT MODE
========================= */
function editAccount() {
  const usernameInput = document.getElementById("username");
  const fullNameInput = document.getElementById("full_name");

  if (usernameInput) usernameInput.disabled = false;
  if (fullNameInput) fullNameInput.disabled = false;

  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) saveBtn.style.display = "block";
}

/* =========================
   SIGN OUT
========================= */
async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    return;
  }

  window.location = "/";
}

/* =========================
   NAVIGATION
========================= */
function goToFeed() {
  window.location = "/feed.html";
}

function goToLearn() {
  window.location = "/learn.html";
}

function goToMeetings() {
  window.location = "/meetings.html";
}

function goToAccount() {
  window.location = "/account.html";
}

function goHome() {
  window.location = "/home.html";
}

/* =========================
   SETTINGS (optional placeholder)
========================= */
function saveSettings() {
  alert("Settings saved!");
}

/* =========================
   INIT
========================= */
loadAccount();

/* =========================
   EXPORT GLOBAL FUNCTIONS
   (if using inline HTML onclick)
========================= */
window.save = save;
window.editAccount = editAccount;
window.signOut = signOut;
window.goToFeed = goToFeed;
window.goToLearn = goToLearn;
window.goToMeetings = goToMeetings;
window.goToAccount = goToAccount;
window.goHome = goHome;
window.saveSettings = saveSettings;