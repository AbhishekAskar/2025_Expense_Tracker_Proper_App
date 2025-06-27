function getResetIdFromUrl() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1]; // gets UUID from /resetpassword/:uuid
}

document.getElementById("resetPasswordBtn").addEventListener('click', async () => {
  const newPassword = document.getElementById("newPassword").value;
  const resetId = getResetIdFromUrl();

  if (!newPassword || !resetId) {
    alert("Missing password or reset ID!");
    return;
  }

  try {
    const response = await axios.post("/passwordreset/update-password", {
      newPassword,
      resetId
    });

    alert(response.data.message);

    if (response.data.success) {
      window.location.href = "/login.html";
    }
  } catch (error) {
    alert(error.response?.data?.message || "Error resetting password");
  }
});
