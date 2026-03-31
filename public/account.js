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