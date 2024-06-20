const e = require("express");

const submitBtn = document.getElementById("login");

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const Username = document.getElementById("user_name").value;
  const password = document.getElementById("password").value;

  const response = await fetch("api/login", {
    method: "POST",
    header: {
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      Username: user_name,
      Password: password,
    }),
  });
  const result = await response.json();
  if (response.ok) {
    window.href.redirect("/dashboard");
  } else {
    alert("invalid username or password");
  }
});
