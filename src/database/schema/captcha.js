require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Captcha',
	new mongoose.Schema(
		{
			discordId: { type: String, unique: true },
			captcha: { type: String },
			isBlock: { type: Boolean, default: false },
			timeBlock: { type: Date }
		},
		{
			timestamps: true
		}
	)
);
