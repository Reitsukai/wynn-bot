require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'LotteryResult',
	new mongoose.Schema(
		{
			counter: { type: Number, default: 0 },
			lotteryType: { type: Number },
			arrayResult: { type: Array, default: [] }
		},
		{
			timestamps: true
		}
	)
);
