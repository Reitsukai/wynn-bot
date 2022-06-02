require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Channel',
	new mongoose.Schema(
		{
			channelId: { type: String, unique: true },
			money: { type: Number, default: 0 }
		},
		{
			timestamps: true
		}
	)
);
