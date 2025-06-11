function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

document.getElementById("resetPasswordBtn").addEventListener('click', async () => {
  const newPassword = document.getElementById("newPassword").value;
  const token = getTokenFromUrl();

  if (!newPassword || !token) {
    alert("Missing password or token!");
    return;
  }

  try {
    const response = await axios.post("/passwordreset/update-password", {
      newPassword,
      token
    });

    alert(response.data.message);

    if (response.data.success) {
      window.location.href = "/login.html";
    }
  } catch (error) {
    alert(error.response?.data?.message || "Error resetting password");
  }
});

function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}
