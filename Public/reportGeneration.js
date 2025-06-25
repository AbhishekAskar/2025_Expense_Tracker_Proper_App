document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const filterTabs = document.querySelectorAll(".filter-tab");
  const tableBody = document.querySelector("#analyticsTable tbody");
  const downloadBtn = document.getElementById("downloadBtn");
  const entriesPerPageSelect = document.getElementById("entriesPerPage");

  // Defaults
  let currentPage = 1;
  let currentFilter = "all";

  // Get saved limit from localStorage or use 10
  let limit = parseInt(localStorage.getItem("entriesPerPage")) || 10;

  // Set dropdown to saved limit
  if (entriesPerPageSelect) {
    entriesPerPageSelect.value = limit;

    // Change event to update limit
    entriesPerPageSelect.addEventListener("change", () => {
      limit = parseInt(entriesPerPageSelect.value);
      localStorage.setItem("entriesPerPage", limit);
      loadData(currentFilter, 1); // Reset to page 1
    });
  }

  // Load data initially
  loadData("all", 1);
  document.querySelector('[data-type="all"]').classList.add("active");

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const type = tab.getAttribute("data-type");
      loadData(type, 1);
    });
  });

  downloadBtn.addEventListener("click", async () => {
    if (downloadBtn.disabled) return;
    try {
      const response = await axios.get("/analytics/download", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to download file");
      console.error(err);
    }
  });

  async function loadData(filter = "all", page = 1) {
    currentFilter = filter;
    currentPage = page;

    try {
      const res = await axios.get(`/analytics/data?filter=${filter}&page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { data, isPremium, totalPages, currentPage: serverPage } = res.data;
      downloadBtn.disabled = !isPremium;

      tableBody.innerHTML = "";

      if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        document.getElementById("paginationControls")?.remove();
        return;
      }

      data.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${entry.date}</td>
          <td>${entry.type}</td>
          <td>₹${entry.amount}</td>
          <td>${entry.category}</td>
          <td>${entry.description}</td>
        `;
        tableBody.appendChild(row);
      });

      renderPagination(totalPages, serverPage);
    } catch (err) {
      tableBody.innerHTML = '<tr><td colspan="5">Failed to load data</td></tr>';
      console.error("Error fetching analytics data", err);
    }
  }

  function renderPagination(totalPages, currentPage) {
    let container = document.getElementById("paginationControls");
    if (!container) {
      container = document.createElement("div");
      container.id = "paginationControls";
      container.classList.add("d-flex", "justify-content-center", "mt-4", "gap-2");
      document.querySelector(".container").appendChild(container);
    }

    container.innerHTML = "";

    if (currentPage > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.className = "btn btn-outline-secondary";
      prevBtn.textContent = "⏮ Prev";
      prevBtn.onclick = () => loadData(currentFilter, currentPage - 1);
      container.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = `btn btn-outline-primary ${i === currentPage ? "active" : ""}`;
      btn.textContent = i;
      btn.onclick = () => loadData(currentFilter, i);
      container.appendChild(btn);
    }

    if (currentPage < totalPages) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-outline-secondary";
      nextBtn.textContent = "Next ⏭";
      nextBtn.onclick = () => loadData(currentFilter, currentPage + 1);
      container.appendChild(nextBtn);
    }
  }
});
