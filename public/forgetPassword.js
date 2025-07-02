document.getElementById("sendResetLink").addEventListener('click', async (e) => {
    e.preventDefault();

    const formData = {
        email: document.getElementById("email").value 
    };

    console.log(formData);
    try {
        console.log("Before the api call!!!")
        const response = await axios.post("/passwordreset/link", formData);

        console.log("After the api call!!!")
        const token = response.data.token;
        localStorage.setItem("token", token);

        alert(response.data.message);
        if (response.data.success) {
            window.location.href = "/login.html";
        }
    } catch (error) {
        const errMsg = error.response?.data?.message || "Unable to send the Reset Link";
        alert(errMsg);
    }
})