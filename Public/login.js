document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = {
    email: e.target.email.value,
    password: e.target.password.value,
  };

  try {
    const response = await axios.post("/user/login", formData);

    const token = response.data.token;
    localStorage.setItem("token", token);

    alert(response.data.message);
    if(response.data.success){
      window.location.href = "/expense.html";
    }
  } catch (error) {
    alert(error.response?.data || "Login failed");
  }
});
