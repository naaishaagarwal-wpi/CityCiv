console.log("JS LOADED");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("SW registered"))
    .catch(console.error);
}

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

window.addEventListener("DOMContentLoaded", () => {
  let deferredPrompt;

  const installBtn = document.getElementById("installBtn");

  if (!installBtn) {
    console.log("Install button not found");
    return;
  }

  // Hide initially (important for UX)
  //installBtn.style.display = "none";

  // Listen for install availability
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    console.log("Install prompt available");

    installBtn.style.display = "block";
  });

  // Click handler
  installBtn.addEventListener("click", async () => {
    console.log("Button clicked");

    if (!deferredPrompt) {
      console.log("No install prompt available");
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log("User choice:", outcome);

    deferredPrompt = null;
    installBtn.style.display = "none";
  });
});