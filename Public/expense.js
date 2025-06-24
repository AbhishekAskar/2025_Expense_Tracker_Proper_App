const token = localStorage.getItem("token");
const cashfree = Cashfree({ mode: "sandbox" });

document.addEventListener("DOMContentLoaded", async () => {
  checkPremiumStatus();
  fetchExpenses();

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
      const response = await axios.post("/purchase/pay", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { paymentSessionId, orderId } = response.data;
      localStorage.setItem("pendingOrderId", orderId);

      let checkoutOptions = {
        paymentSessionId,
        redirectTarget: "_self",
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

  // 👇 Refresh leaderboard if visible
  const leaderboardBtn = document.getElementById("leaderBoard");
  if (!leaderboardBtn.classList.contains("d-none")) {
    loadLeaderboard();
  }
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

    // 👇 Automatically refresh leaderboard after deletion
    const leaderboardBtn = document.getElementById("leaderBoard");
    if (!leaderboardBtn.classList.contains("d-none")) {
      loadLeaderboard();
    }

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
    const lbBtn = document.getElementById("leaderBoard");
    const analyticsBtn = document.getElementById("analyticsBtn");

    if (isPremium) {
      premiumDiv.classList.remove('d-none');
      upgradeBtn.classList.add('d-none');
      lbBtn.classList.remove("d-none");
      analyticsBtn.classList.remove("d-none"); // 👈 Show analytics

      analyticsBtn.addEventListener("click", () => {
        window.location.href = "/reportGeneration.html";
      });

      let leaderboardVisible = false;
      lbBtn.addEventListener("click", () => {
        const leaderboardDiv = document.getElementById("leaderboardDiv");
        if (leaderboardVisible) {
          leaderboardDiv.innerHTML = "";
          leaderboardVisible = false;
        } else {
          loadLeaderboard();
          leaderboardVisible = true;
        }
      });

    } else {
      premiumDiv.classList.add('d-none');
      upgradeBtn.classList.remove('d-none');
      lbBtn.classList.add("d-none");
      analyticsBtn.classList.add("d-none"); // 👈 Hide analytics
    }
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
}


async function loadLeaderboard() {
  try {
    const response = await axios.get("/leaderBoard", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const leaderboardDiv = document.getElementById("leaderboardDiv");
    leaderboardDiv.innerHTML = `<h4 class="text-center">🏆 Leaderboard</h4>`;

    const sorted = response.data.leaderboard.sort((a, b) => b.totalExpense - a.totalExpense);

    sorted.forEach((user, index) => {
      const name = user.name || "Unknown User";
      const total = user.totalExpense || 0;

      const item = document.createElement("p");
      item.innerHTML = `<strong>#${index + 1}</strong> - ${name}: ₹${total}`;
      leaderboardDiv.appendChild(item);
    });

  } catch (err) {
    console.error("❌ Error loading leaderboard", err);
  }
}



