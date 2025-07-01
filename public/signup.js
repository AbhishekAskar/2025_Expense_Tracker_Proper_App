document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = {
    name: e.target.name.value,
    email: e.target.email.value,
    password: e.target.password.value,
  };

  try {
    const response = await axios.post("/user/signup", formData);
    alert(response.data.message)
    if(response.data.success){
      window.location.href = "/login.html";
    }
  } catch (error) {
    alert(error.response?.data || "Signup failed");
  }
});

console.log("sirdhar")