document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const isPremium = localStorage.getItem("isPremium") === "true"; // Simulated
  const dummyData = JSON.parse(localStorage.getItem("dummyAnalyticsData") || "[]");
  const filterTabs = document.querySelectorAll(".filter-tab");
  const tableBody = document.querySelector("#analyticsTable tbody");
  const downloadBtn = document.getElementById("downloadBtn");

  // Enable/Disable download
  downloadBtn.disabled = !isPremium;

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const type = tab.getAttribute("data-type");
      renderTable(filterData(type));
    });
  });

  downloadBtn.addEventListener("click", () => {
    if (!isPremium) return alert("Premium users only!");
    downloadCSV(dummyData);
  });

  renderTable(dummyData);

  function filterData(type) {
    if (type === "all") return dummyData;

    const now = new Date();
    return dummyData.filter(entry => {
      const entryDate = new Date(entry.date);

      if (type === "daily") {
        return entryDate.toDateString() === now.toDateString();
      } else if (type === "weekly") {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return entryDate >= oneWeekAgo;
      } else if (type === "monthly") {
        return (
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      }
    });
  }

  function renderTable(data) {
    tableBody.innerHTML = "";
    if (!data.length) {
      tableBody.innerHTML = "<tr><td colspan='5'>No records found</td></tr>";
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
  }

  function downloadCSV(data) {
    let csvContent = "Date,Type,Amount,Category,Description\n";
    data.forEach(entry => {
      csvContent += `${entry.date},${entry.type},${entry.amount},${entry.category},${entry.description}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
  }
});
