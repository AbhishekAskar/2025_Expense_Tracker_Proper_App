const Expense = require('../Models/expenseModel');
const { uploadToS3 } = require('../Services/s3Service');
const DownloadHistory = require('../Models/downloadHistory');

const downloadExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    const data = JSON.stringify(expenses);
    const filename = `expenses-${req.user.id}-${Date.now()}.txt`;

    const s3Response = await uploadToS3(data, filename);

    // Save URL to download history
    await DownloadHistory.create({
      fileURL: s3Response.Location,
      userId: req.user.id
    });

    return res.status(200).json({ fileURL: s3Response.Location, success: true });
  } catch (err) {
    console.error('❌ Error while downloading expenses:', err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

const getDownloadHistory = async (req, res) => {
  try {
    const history = await DownloadHistory.findAll({
      where: { userId: req.user.id },
      order: [['downloadedAt', 'DESC']],
    });

    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("❌ Failed to fetch history:", err);
    res.status(500).json({ success: false, message: "Error retrieving history" });
  }
};



module.exports = { 
  downloadExpenses,
  getDownloadHistory
};
