require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'LotteryArray',
	new mongoose.Schema({
		arrayInit: { type: Array, default: [] },
		lotteryType: { type: Number, default: 0 },
		arrayBackup: { type: Array, default: [] }
	})
);
