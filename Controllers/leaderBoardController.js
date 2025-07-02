const { Expense, User } = require('../Models');
const { Sequelize } = require('sequelize');

const getLeaderboard = async (req, res) => {
  try {
    
    const currentUser = await User.findByPk(req.user.id);
    const isPremium = currentUser?.isPremium || false;

    if (!isPremium) {
      return res.status(200).json({ isPremium, leaderboard: [] });
    }

    const leaderboard = await User.findAll({
      attributes: ['name', 'totalExpense'],
      order: [['totalExpense', 'DESC']]
    });

    res.status(200).json({ isPremium, leaderboard });
  } catch (err) {
    console.error("Error in getLeaderboard:", err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  getLeaderboard
};
