exports.submitExpense = (req, res) => {
  console.log("🔥 Headers:", req.headers);
  console.log("📦 Payload:", req.body);

  res.status(200).json({
    message: "Expense received!",
    receivedData: req.body,
    customHeader: req.headers["x-custom-header"] || "No custom header found"
  });
};
