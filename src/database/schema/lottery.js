require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Lottery',
	new mongoose.Schema(
		{
			discordId: { type: String, unique: true },
			lotteryType: { type: Number },
			code: { type: Number }
		},
		{
			timestamps: true
		}
	)
);
