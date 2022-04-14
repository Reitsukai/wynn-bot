require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Daily',
	new mongoose.Schema(
		{
			discordId: { type: String, unique: true },
			dailyStreak: { type: Number, default: 0 },
			lastDaily: Date
		},
		{
			timestamps: true
		}
	)
);
