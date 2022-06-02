require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Lucky',
	new mongoose.Schema(
		{
			discordId: { type: String },
			moneyBet: { type: Number, default: 0 },
			arrayBet: { type: Array, default: [] }
		},
		{
			timestamps: true
		}
	)
);
