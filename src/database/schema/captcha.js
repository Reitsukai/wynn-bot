require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Captcha',
	new mongoose.Schema({
		discordId: { type: String, unique: true },
		captcha: { type: String },
		deadline: { type: Date },
		isResolve: { type: Boolean, default: false },
		timeResolve: { type: Date },
		wrong: { type: Number, default: 0 },
		reminder: { type: Number, default: 0 },
		isBlock: { type: Boolean, default: false },
		timeBlock: { type: Date }
	})
);
