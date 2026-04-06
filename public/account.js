const form = document.getElementById('signup-form')
const username_input = document.getElementById('username')
const email_input = document.getElementById('email')
const password_input = document.getElementById('password')
const confirm_password_input = document.getElementById('confirm_password')

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

function editAccount() {
    username_change.disabled = false
    email_change.disabled = false
    password_change.disabled = false
    confirm_password_change.disabled = false
    document.getElementById("saveBtn").style.display = "block"
}

function signOut() {
    localStorage.removeItem("username")
    localStorage.removeItem("email")
    window.location = "/"
}

function deleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        // Here you would typically make an API call to delete the account from the server
        localStorage.removeItem("username")
        localStorage.removeItem("email")
        window.location = "/"
    }
}

function editSettings() {
    notificationPreferencesInput.disabled = false
    privacySettingsInput.disabled = false
    languageInput.disabled = false
    themeInput.disabled = false
    document.getElementById("saveSettingsBtn").style.display = "block"
}

function saveSettings() {
    // Here you would typically make an API call to save the settings to the server
    alert("Settings saved!")
}