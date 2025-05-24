document.getElementById("expenseForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = {
    title: e.target.title.value,
    amount: e.target.amount.value,
    date: e.target.date.value,
  };

  try {
    const response = await axios.post("/api/expenses", formData, {
      headers: {
        "Content-Type": "application/json",
        "X-Custom-Header": "AbhishekTheBackendBoss"
      }
    });

    console.log("✅ Server Response:", response.data);
    alert("Expense submitted successfully!");

  } catch (error) {
    console.error("❌ Error submitting expense:", error);
    alert("Failed to submit expense.");
  }
});
