const token = localStorage.getItem("token");
const cashfree = Cashfree({ mode: "sandbox" });

document.addEventListener("DOMContentLoaded", () => {
  checkPremiumStatus();
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
      addExpenseToList(response.data);
    } catch (error) {
      alert("Error adding expense: " + (error.response?.data || error.message));
    }
  });

  document.getElementById("renderBtn").addEventListener("click", async () => {
    try {
      const response = await axios.post("/premium/pay", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const paymentSessionId = response.data.paymentSessionId;
      let checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self", // reloads same page after payment
        onSuccess: async () => {
          console.log("💳 Payment success callback triggered!");
          try {
            const verifyRes = await axios.post("/purchase/update-status", {
              orderId: response.data.order_id  // make sure this value is correctly passed
            }, {
              headers: {
                Authorization: token  // or however you're passing the JWT
              }
            });


            if (verifyRes.data.success) {
              alert("🎉 Payment successful! You're now a Premium User.");
              location.reload(); // reload page to update UI
            } else {
              alert("⚠️ Payment done but verification failed!");
            }
          } catch (err) {
            alert("⚠️ Error verifying payment: " + err.message);
          }
        },
        onFailure: (err) => {
          console.error("❌ Payment failed:", err);
          alert("Payment failed. Please try again.");
        },
        onError: (err) => {
          console.error("⚠️ Payment error:", err);
          alert("Something went wrong. Try again.");
        }
      };

      await cashfree.checkout(checkoutOptions);
    } catch (error) {
      console.log("Error in payment:", error);
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
    li.remove();
  };

  li.appendChild(delBtn);
  expenseList.appendChild(li);
}

async function fetchExpenses() {
  try {
    const response = await axios.get("/expense", {
      headers: { Authorization: `Bearer ${token}` }
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
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    alert("Failed to delete expense");
  }
}

async function checkPremiumStatus() {
  try {
    const response = await axios.get('/user/details', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const isPremium = response.data.isPremium;
    if (isPremium) {
      document.getElementById('premium-status').textContent = "🌟 You are a Premium User!";
      document.getElementById('renderBtn').style.display = 'none';
    }
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
}
