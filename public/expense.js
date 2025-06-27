const token = localStorage.getItem("token");
const cashfree = Cashfree({ mode: "sandbox" });

document.addEventListener("DOMContentLoaded", async () => {
  checkPremiumStatus();
  fetchExpenses();
  fetchDownloadHistory();


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

let currentPage = 1;
const limit = 10;

async function fetchExpenses(page = 1) {
  try {
    const response = await axios.get(`/expense?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const expenseList = document.getElementById("expenseItems");
    expenseList.innerHTML = "";

    response.data.expenses.forEach(addExpenseToList);

    renderPagination(response.data.currentPage, response.data.totalPages);
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
    const leaderboardRow = document.getElementById("leaderboardRow"); // 👈 new

    if (isPremium) {
      premiumDiv.classList.remove('d-none');
      upgradeBtn.classList.add('d-none');
      lbBtn.classList.remove("d-none");
      analyticsBtn.classList.remove("d-none");
      leaderboardRow.classList.remove("d-none"); // 👈 show

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
      analyticsBtn.classList.add("d-none");
      leaderboardRow.classList.add("d-none"); // 👈 hide the whole row
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

    const leaderboardRow = document.getElementById("leaderboardRow");
    const leaderboardDiv = document.getElementById("leaderboardDiv");

    const sorted = response.data.leaderboard?.sort((a, b) => b.totalExpense - a.totalExpense);

    // If there's valid data, show the section
    if (sorted && sorted.length > 0) {
      leaderboardRow.classList.remove("d-none");
      leaderboardDiv.innerHTML = `<h4 class="text-center mb-3">🏆 Leaderboard</h4>`;

      sorted.forEach((user, index) => {
        const name = user.name || "Unknown User";
        const total = user.totalExpense || 0;

        const item = document.createElement("p");
        item.innerHTML = `<strong>#${index + 1}</strong> - ${name}: ₹${total}`;
        leaderboardDiv.appendChild(item);
      });
    } else {
      leaderboardRow.classList.add("d-none");
    }

  } catch (err) {
    console.error("❌ Error loading leaderboard", err);
    document.getElementById("leaderboardRow").classList.add("d-none");
  }
}



function renderPagination(currentPage, totalPages) {
  const paginationDiv = document.getElementById("paginationControls");
  paginationDiv.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "⬅️ Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => fetchExpenses(currentPage - 1);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ➡️";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => fetchExpenses(currentPage + 1);

  const pageInfo = document.createElement("span");
  pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;

  paginationDiv.appendChild(prevBtn);
  paginationDiv.appendChild(pageInfo);
  paginationDiv.appendChild(nextBtn);
}

document.getElementById("downloadBtn").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/user/download", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 200) {
      const a = document.createElement("a");
      a.href = res.data.fileURL;
      a.download = 'expenses.txt';
      a.click();
    } else {
      alert("Failed to download file!");
    }
  } catch (err) {
    console.error("❌ Download Error:", err);
    alert("Something went wrong");
  }
});


async function fetchDownloadHistory() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/user/download-history", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const list = document.getElementById("historyList");
    list.innerHTML = ""; // Clear old history

    if (res.data.success && res.data.history.length > 0) {
      res.data.history.forEach(entry => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        const date = new Date(entry.downloadedAt).toLocaleString();

        li.innerHTML = `
          <a href="${entry.fileURL}" target="_blank" class="text-decoration-none">Download from ${date}</a>
          <span class="badge bg-primary rounded-pill">📥</span>
        `;

        list.appendChild(li);
      });
    } else {
      list.innerHTML = `<li class="list-group-item">No downloads yet 🤷‍♂️</li>`;
    }
  } catch (err) {
    console.error("❌ Failed to fetch download history:", err);
    document.getElementById("historyList").innerHTML = `<li class="list-group-item">Error loading history</li>`;
  }
}
