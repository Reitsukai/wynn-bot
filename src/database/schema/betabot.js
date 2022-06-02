require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'betabot',
	new mongoose.Schema(
		{
			discordId: { type: String, unique: true },
			isClaim: { type: Boolean, default: false }
		},
		{
			timestamps: true
		}
	)
);
