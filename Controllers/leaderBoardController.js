const { Expense, User } = require('../Models');
const { Sequelize } = require('sequelize');

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['name', 'totalExpense'],
      order: [['totalExpense', 'DESC']]
    });

    res.status(200).json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  getLeaderboard
};
