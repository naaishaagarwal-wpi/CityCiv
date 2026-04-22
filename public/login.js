import { supabase } from "./supabaseClient.js";

//this documentation gave all references for authentication code: https://supabase.com/docs/guides/auth/users

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

// sign up
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

// login
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
      window.location.href = "/home.html";
    }
  });
}

// google log in code
//(not in use right now because did not set up google auth on Supabase, this is just placeholder for potential future work)
const googleBtn = document.getElementById("google");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) message.textContent = error.message;
  });
}

// if on login page and signed in this will automatically send to home page
if (window.location.pathname === "/" || window.location.pathname.includes("index")) {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) window.location.href = "/home.html";
}