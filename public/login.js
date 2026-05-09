//supabase auth documentation helped with the development of this file: https://supabase.com/docs/guides/auth

import { supabase } from "./supabaseClient.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const fullNameInput = document.getElementById("full_name");

const message = document.getElementById("message");

// SIGN UP
const signupBtn = document.getElementById("signup");

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {

    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;
    const full_name = fullNameInput.value;

    // validation
    if (!email || !password || !username || !full_name) {
      message.textContent = "Please fill out all fields.";
      return;
    }

    // create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name,
        },
      },
    });

    console.log("SIGNUP DATA:", data);
    console.log("SIGNUP ERROR:", error);

    if (error) {
      message.textContent = error.message;
      return;
    }

    const user = data.user;

    // insert into profiles table
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: user.id,
            username: username,
            full_name: full_name,
          },
        ]);

      console.log("PROFILE ERROR:", profileError);

      if (profileError) {
        message.textContent = profileError.message;
        return;
      }
    }

    window.location.href = "/home.html";
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