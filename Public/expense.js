document.addEventListener("DOMContentLoaded", () => {
  fetchExpenses();

  document.getElementById("expenseForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      money: e.target.money.value,
      description: e.target.description.value,
      category: e.target.category.value
    };

    try {
      await axios.post("/expense", formData);
      e.target.reset();
      fetchExpenses(); // Refresh list after submission
    } catch (error) {
      alert("Error adding expense: " + (error.response?.data || error.message));
    }
  });
});

async function fetchExpenses() {
  try {
    const response = await axios.get("/expense");
    const expenseList = document.getElementById("expenseItems");
    expenseList.innerHTML = ""; // Clear list

    response.data.forEach(exp => {
      const li = document.createElement("li");
      li.textContent = `${exp.money} - ${exp.description} (${exp.category}) `;

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌ Delete";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = () => deleteExpense(exp.id);

      li.appendChild(delBtn);
      expenseList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching expenses", error);
  }
}

async function deleteExpense(id) {
  try {
    await axios.delete(`/expense/delete/${id}`);
    fetchExpenses(); // Refresh list
  } catch (error) {
    alert("Failed to delete expense");
  }
}
