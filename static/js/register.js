const submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener('click', async (e) => {
  e.preventDefault()

  const userName = document.getElementById("user_name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("full_name").value;

  const response = await fetch("api/register", {
    method: "POST",
    headers: {
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      username: userName,
      password,
      email: email,
      full_name: fullName,
    }),
  });
  const result = await response.json()
  
  if(!response.ok) return alert("Registration failed");

  alert(result)
  window.location.href = "/login"
})