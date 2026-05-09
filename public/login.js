//supabase auth documentation helped with the development of this file: https://supabase.com/docs/guides/auth

import { supabase } from "./supabaseClient.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const fullNameInput = document.getElementById("full_name");
const signupFields = document.getElementById("signupFields");
const message = document.getElementById("message");
let signupMode = false;

const signupBtn = document.getElementById("signup");

// SIGN UP
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {

    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;
    const full_name = fullNameInput.value;

    // basic validation
    if (!email || !password || !username || !full_name) {
      message.textContent = "Please fill out all fields.";
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: full_name,
        },
      },
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      message.textContent = error.message;
    } else {
      message.textContent =
        window.location.href = "/home.html";
    }
  });
}

// LOGIN
const loginBtn = document.getElementById("login");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    if (signupMode) {
      signupFields.classList.add("hidden");
      signupBtn.textContent = "Sign Up";
      message.textContent = "";
      signupMode = false;
    }

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

// GOOGLE LOGIN (optional)
const googleBtn = document.getElementById("google");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) message.textContent = error.message;
  });
}

// AUTO REDIRECT IF LOGGED IN
(async () => {
  if (
    window.location.pathname === "/" ||
    window.location.pathname.includes("index")
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) window.location.href = "/home.html";
  }
})();