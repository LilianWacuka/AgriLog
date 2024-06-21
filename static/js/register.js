

const submitBtn = document.getElementById("btnRegister");

submitBtn.addEventListener('click', async (e) =>{
  e.preventDefault()

  const userName = document.getElementById("user_name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("full_name").value;
  
  const response = await fetch("/register", {
    method: "POST",
    header: {
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      username: userName,
      password: password,
      email: email,
      fullname: fullName,
    }),
  });
const result = await response.json()
if(response.ok){
  window.location.href('/index')
}else {
  alert('Registration failed')
}
})
 
