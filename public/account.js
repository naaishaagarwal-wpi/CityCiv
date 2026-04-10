//This file contains JavaScript code for handling user interactions on the account page, including form validation, navigation, and account management functions.
//This page was constructed with the aid of a Coding2GO Youtube video: https://www.youtube.com/watch?v=bVl5_UdcAy0&t=222s

// Get references to form elements
const form = document.getElementById('signup-form')
const username_input = document.getElementById('username')
const email_input = document.getElementById('email')
const password_input = document.getElementById('password')
const confirm_password_input = document.getElementById('confirm_password')

//Manages form error handling for both the signup and login forms, ensuring that users provide necessary information and that passwords match when signing up.
form.addEventListener('submit', (e) => {
    e.preventDefault()

    let errors = []

    if(username_input){
        errors = getSignupFormErrors(username_input.value, email_input.value, password_input.value, confirm_password_input.value)
    }
    else{
        errors = getLoginFormErrors(username_input.value, password_input.value)
    }

    if(errors.length > 0){
        e.preventDefault()
    }
})

//Function for handling signup form errors
function getSignupFormErrors(username, email, password, confirm_password){
    let errors = []

    if(username.length === 0){
        errors.push('Username is required')
        firstname_input.parentElement.classList.add('error')
    }

    if(email.length === 0){
        errors.push('Email is required')
        email_input.parentElement.classList.add('error')

    }

    if(password.length === 0){
        errors.push('Password is required')
        password_input.parentElement.classList.add('error')
    }

    if(confirm_password.length === 0){
        errors.push('Please confirm your password')
        confirm_password_input.parentElement.classList.add('error')
    }

    if(password !== confirm_password){
        errors.push('Passwords do not match')
    }

    return errors
}

//function for handling login form errors
function getLoginFormErrors(username, password){
    let errors = []

    if(username.length === 0){
        errors.push('Username is required')
        username_input.parentElement.classList.add('error')
    }

    if(password.length === 0){
        errors.push('Password is required')
        password_input.parentElement.classList.add('error')
    }

    return errors
}

//navigation functions for the various pages of the website, allowing users to easily move between different sections of the app.
function goToFeed() {
    window.location = "/feed.html"
  }
  function goToLearn() {
    window.location = "/learn.html"
  }
  function goToMeetings() {
    window.location = "/meetings.html"
  }
  function goToAccount() {
    window.location = "/account.html"
  }
function goHome() {
    window.location = "/home.html"
}

//function to save user information to local storage and potentially send it to the server for account creation or updates.
function save() {

      fetch("/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username_input.value }),
      })
      .then(() => {
        localStorage.setItem("username", username_input.value)
        localStorage.setItem("email", email_input.value)
      })
    }

//function for editing account information, i.e. changing username, email and password.
function editAccount() {
    username_change.disabled = false
    email_change.disabled = false
    password_change.disabled = false
    confirm_password_change.disabled = false
    document.getElementById("saveBtn").style.display = "block"
}

//function for signing out, i.e. removing local storage information and redirecting to the home page.
function signOut() {
    localStorage.removeItem("username")
    localStorage.removeItem("email")
    localStorage.removeItem("password")
    window.location = "/"
}

//function for deleting account, which includes a confirmation prompt to prevent accidental deletions, and if confirmed, it removes user information from local storage and redirects to the home page. In a real application, this would also involve an API call to delete the account from the server.
function deleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        // Here you would typically make an API call to delete the account from the server
        localStorage.removeItem("username")
        localStorage.removeItem("email")
        localStorage.removeItem("password")
        window.location = "/"
    }
}

//function for editing user settings, such as notification preferences, privacy settings, language and theme.
function editSettings() {
    notificationPreferencesInput.disabled = false
    privacySettingsInput.disabled = false
    languageInput.disabled = false
    themeInput.disabled = false
    document.getElementById("saveSettingsBtn").style.display = "block"
}

//function for saving user settings, which would typically involve an API call to save the settings to the server, but here it simply displays an alert confirming that the settings have been saved.
function saveSettings() {
    // Here you would typically make an API call to save the settings to the server
    alert("Settings saved!")
}