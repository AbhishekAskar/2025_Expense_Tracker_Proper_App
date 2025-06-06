const token = localStorage.getItem("token");
const cashfree = Cashfree({ mode: "sandbox" });

document.addEventListener("DOMContentLoaded", async () => {
  checkPremiumStatus();
  fetchExpenses();

  // 🔁 Fallback: Try verifying pending order after redirect
  const pendingOrderId = localStorage.getItem("pendingOrderId");
  if (pendingOrderId) {
    try {
      const verifyRes = await axios.post("/purchase/update-status", {
        orderId: pendingOrderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (verifyRes.data.message === "User upgraded to premium") {
        alert("🎉 Premium activated after redirect!");
        localStorage.removeItem("pendingOrderId");
        location.reload();
      }
    } catch (error) {
      console.error("🧨 Fallback verification failed:", error);
    }
  }

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

      const { paymentSessionId, orderId } = response.data;

      // 💾 Save orderId in case redirect happens before callback fires
      localStorage.setItem("pendingOrderId", orderId);

      let checkoutOptions = {
        paymentSessionId,
        redirectTarget: "_self", // reloads same page after payment
        onSuccess: async () => {
          console.log("💳 Payment success callback triggered!");
          try {
            const verifyRes = await axios.post("/purchase/update-status", {
              orderId
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (verifyRes.data.message === "User upgraded to premium") {
              alert("🎉 Payment successful! You're now a Premium User.");
              localStorage.removeItem("pendingOrderId");
              location.reload();
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
      alert("Payment error: " + error.message);
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
    const premiumDiv = document.getElementById('premium-status');
    const upgradeBtn = document.getElementById('renderBtn');

    if (isPremium) {
      premiumDiv.classList.remove('d-none');
      upgradeBtn.classList.add('d-none');
    } else {
      premiumDiv.classList.add('d-none');
      upgradeBtn.classList.remove('d-none');
    }
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
}

