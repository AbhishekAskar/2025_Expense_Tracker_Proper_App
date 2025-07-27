const User = require('../Models/userModel');

const getLeaderboard = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const isPremium = currentUser?.isPremium || false;

    if (!isPremium) {
      return res.status(200).json({ isPremium, leaderboard: [] });
    }

    const leaderboard = await User.find({}, 'name totalExpense')
      .sort({ totalExpense: -1 }); // Descending order

    res.status(200).json({ isPremium, leaderboard });
  } catch (err) {
    console.error("Error in getLeaderboard:", err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  getLeaderboard
};
