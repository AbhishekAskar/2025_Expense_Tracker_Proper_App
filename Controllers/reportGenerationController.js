const Expense = require("../Models/expenseModel"); // adjust path if needed
const User = require("../Models/userModel");
const { Op } = require("sequelize");
const { Parser } = require("json2csv");

const getAnalyticsData = async (req, res) => {
  const userId = req.user.id;
  const filter = req.query.filter || "all";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const user = await User.findByPk(userId);
    if (!user.isPremium) {
      return res.status(403).json({ message: "Only premium users allowed", isPremium: false });
    }

    let whereCondition = { userId };
    const now = new Date();

    if (filter === "daily") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      whereCondition.createdAt = { [Op.between]: [start, end] };
    } else if (filter === "weekly") {
      const start = new Date(now.setDate(now.getDate() - now.getDay()));
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      whereCondition.createdAt = { [Op.between]: [start, end] };
    } else if (filter === "monthly") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      whereCondition.createdAt = { [Op.between]: [start, end] };
    }

    const { count, rows } = await Expense.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const data = rows.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      type: "Expense",
      amount: item.money,
      category: item.category,
      description: item.description
    }));

    res.status(200).json({
      data,
      isPremium: true,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const downloadExpenses = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user.isPremium) return res.status(403).json({ message: "Only premium users allowed" });

    const expenses = await Expense.findAll({ where: { userId } });

    const data = expenses.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      type: "Expense",
      amount: item.money,
      category: item.category,
      description: item.description
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
    res.send(csv);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Failed to download expenses" });
  }
};

module.exports = {
  getAnalyticsData,
  downloadExpenses
};
