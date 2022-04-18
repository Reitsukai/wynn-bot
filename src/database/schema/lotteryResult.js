require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'LotteryResult',
	new mongoose.Schema(
		{
			arrayInit: { type: Array },
			typeLottery: { type: Number },
			count: { type: Number, default: 0 },
			arrayResult: { type: Array, default: [] }
		},
		{
			timestamps: true
		}
	)
);
