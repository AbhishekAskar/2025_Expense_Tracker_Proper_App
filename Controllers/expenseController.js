const Expense = require('../Models/expenseModel');
const User = require('../Models/userModel');
const sequelize = require('../Utils/db-connection');

const addExpense = async (req, res) => {
  console.log("🔥 In addExpense Controller");

  const t = await sequelize.transaction();

  try {
    console.log("📦 Payload Received:", req.body);

    const { money, description, category } = req.body;
    const userId = req.user?.id; // ✅ Consistent with middleware
    console.log("🙋 User ID:", userId);

    const expense = await Expense.create({
      money: parseInt(money), // ✅ Parse to integer if needed
      description,
      category,
      userId
    }, { transaction: t });

    const user = await User.findByPk(userId);
    if (!user) {
      console.log("🚨 User not found!");
      throw new Error("User not found");
    }

    user.totalExpense += parseInt(money);
    await user.save({ transaction: t });

    await t.commit();
    console.log("✅ Expense added and transaction committed");
    res.status(201).json(expense );
  } catch (err) {
    console.error("❌ Error in addExpense:", err);
    await t.rollback();
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getExpense = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Fix here (was req.user.userId)
    const expense = await Expense.findAll({ where: { userId } });
    res.status(200).json(expense);
  } catch (error) {
    console.log("❌ Error in getExpense:", error);
    res.status(500).send("Error occurred!");
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.destroy({ where: { id } });
    res.status(200).send("Expense deleted successfully");
  } catch (error) {
    console.log("❌ Error in deleteExpense:", error);
    res.status(500).send("Failed to delete expense");
  }
};

module.exports = {
  addExpense,
  getExpense,
  deleteExpense
};
