const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log(username, password)

  const response = await fetch("api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const result = response.json()
  console.log(result)
if(!result) return alert("couldn't log in") 

  alert("login successfully")
  window.location.href = "/"
});
