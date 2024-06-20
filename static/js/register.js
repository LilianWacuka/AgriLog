const e = require("express");

const submitBtn = document.getElementById('register');

submitBtn.addEventListener('click', async (e) =>{
  e.preventDefault()

  const Username = document.getElementById("user_name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const Fullname = document.getElementById("full_name").value;
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
  window.href.redirect('/login')
}else {
  alert('Registration failed')
}
})
 
