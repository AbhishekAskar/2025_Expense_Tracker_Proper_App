document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = {
    email: e.target.email.value,
    password: e.target.password.value,
  };

  try {
    const response = await axios.post("/api/login", formData);
    alert(response.data);
    // TODO: redirect to dashboard/home page
  } catch (error) {
    alert(error.response?.data || "Login failed");
  }
});
