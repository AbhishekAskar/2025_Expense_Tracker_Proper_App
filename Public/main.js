document.getElementById("expenseForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value
    };

    try {
        const response = await axios.post("/api/expenses", formData, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("✅ Server Response:", response.data);
        alert("Expense submitted successfully!");

    } catch (error) {
        console.error("❌ Error submitting expense:", error);
        if (error.response && error.response.data) {
            alert(error.response.data);
        } else {
            alert("Failed to submit expense.");
        }
    }
});
