require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Lottery',
	new mongoose.Schema(
		{
			discordId: { type: String },
			lotteryType: { type: Number },
			code: { type: Number, unique: true }
		},
		{
			timestamps: true
		}
	)
);
