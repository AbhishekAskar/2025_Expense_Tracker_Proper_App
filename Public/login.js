document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = {
    email: e.target.email.value,
    password: e.target.password.value,
  };

  try {
    const response = await axios.post("/user/login", formData);
    alert(response.data || "Login successful!");
    window.location.href = "/expense.html";
  } catch (error) {
    alert(error.response?.data || "Login failed");
  }
});
