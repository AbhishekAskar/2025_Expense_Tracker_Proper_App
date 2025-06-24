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
  const t = await sequelize.transaction();  // Use a transaction for consistency

  try {
    const { id } = req.params;

    // Step 1: Find the expense before deleting
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).send("Expense not found");
    }

    // Step 2: Get the user associated with the expense
    const user = await User.findByPk(expense.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Step 3: Update the user's totalExpense
    user.totalExpense -= parseInt(expense.money); // Decrement the expense amount
    await user.save({ transaction: t }); // Save with transaction

    // Step 4: Delete the expense
    await Expense.destroy({ where: { id }, transaction: t });

    // Step 5: Commit the transaction
    await t.commit();

    res.status(200).send("Expense deleted and total expense updated successfully");
  } catch (error) {
    console.error("❌ Error in deleteExpense:", error);
    await t.rollback(); // Rollback if there's an error
    res.status(500).send("Failed to delete expense");
  }
};


module.exports = {
  addExpense,
  getExpense,
  deleteExpense
};
