const token = localStorage.getItem("token");

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
      const response = await axios.post("/expense", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      e.target.reset();

      // Instead of refetching everything, just add the new item directly
      addExpenseToList(response.data);
    } catch (error) {
      alert("Error adding expense: " + (error.response?.data || error.message));
    }
  });
});

function addExpenseToList(exp) {
  const expenseList = document.getElementById("expenseItems");

  const li = document.createElement("li");
  li.textContent = `${exp.money} - ${exp.description} (${exp.category}) `;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.style.marginLeft = "10px";
  delBtn.onclick = () => {
    deleteExpense(exp.id);
    li.remove(); // Remove from UI immediately on delete
  };

  li.appendChild(delBtn);
  expenseList.appendChild(li);
}

async function fetchExpenses() {
  try {
    const response = await axios.get("/expense", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const expenseList = document.getElementById("expenseItems");
    expenseList.innerHTML = "";

    response.data.forEach(addExpenseToList);
  } catch (error) {
    console.error("Error fetching expenses", error);
  }
}

async function deleteExpense(id) {
  try {
    await axios.delete(`/expense/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // No need to call fetchExpenses, since we already removed the item from UI in delBtn.onclick
  } catch (error) {
    alert("Failed to delete expense");
  }
}
