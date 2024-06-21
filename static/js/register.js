const e = require("express");

const submitBtn = document.getElementById('register');

submitBtn.addEventListener('click', async (e) =>{
  e.preventDefault()

  const userName = document.getElementById("user_name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("full_name").value;
  const response = await fetch("api/register", {
    method: "POST",
    header: {
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      Username: user_name,
      Password: password,
      email: email,
      Fullname: full_name,
    }),
  });
const result = await response.json()
if(response.ok){
  window.location.href('/login')
}else {
  alert('Registration failed')
}
})
 
