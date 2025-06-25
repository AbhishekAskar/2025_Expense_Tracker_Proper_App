const Expense = require('../Models/expenseModel');
const User = require('../Models/userModel');
const sequelize = require('../Utils/db-connection');

// Add Expense with transaction
const addExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { money, description, category } = req.body;
    const userId = req.user?.id;

    if (!money || !description || !category || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedMoney = parseFloat(money);
    if (isNaN(parsedMoney) || parsedMoney < 0) {
      return res.status(400).json({ error: "Invalid money amount" });
    }

    const expense = await Expense.create({
      money: parsedMoney,
      description,
      category,
      userId
    }, { transaction: t });

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    user.totalExpense += parsedMoney;
    await user.save({ transaction: t });

    await t.commit();
    res.status(201).json(expense);
  } catch (err) {
    console.error("❌ Error in addExpense:", err.message);
    await t.rollback();
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get expenses with pagination
const getExpense = async (req, res) => {
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const offset = (page - 1) * limit;
  const userId = req.user?.id;

  try {
    const { count, rows } = await Expense.findAndCountAll({
      where: { userId },
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      expenses: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error("❌ Error in getExpense:", err.message);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// Delete expense and update user's totalExpense
const deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findByPk(expense.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.totalExpense -= parseFloat(expense.money);
    if (user.totalExpense < 0) user.totalExpense = 0;

    await user.save({ transaction: t });
    await Expense.destroy({ where: { id }, transaction: t });

    await t.commit();
    res.status(200).json({ message: "Expense deleted and total updated" });
  } catch (error) {
    console.error("❌ Error in deleteExpense:", error.message);
    await t.rollback();
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

module.exports = {
  addExpense,
  getExpense,
  deleteExpense
};
