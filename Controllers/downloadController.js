const Expense = require('../Models/expenseModel');
const { uploadToS3 } = require('../Services/s3Service');

const downloadExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });

    // ✅ Convert expenses into a readable text format
    const data = expenses.map((exp) => {
      return `Amount: ₹${exp.money}, Category: ${exp.category}, Description: ${exp.description}, Date: ${new Date(exp.createdAt).toLocaleString()}`;
    }).join('\n');

    // ✅ Use .txt instead of .json
    const filename = `expenses-${req.user.id}-${Date.now()}.txt`;

    const s3Response = await uploadToS3(data, filename);

    return res.status(200).json({ fileURL: s3Response.Location, success: true });
  } catch (err) {
    console.error('❌ Error while downloading expenses:', err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

module.exports = { downloadExpenses };
