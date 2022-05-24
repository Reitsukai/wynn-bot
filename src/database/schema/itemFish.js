require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'ItemFish',
	new mongoose.Schema(
		{
			discordId: { type: String, unique: true },
			bait: { type: Number, default: 0 },
			location: { type: String, default: 'tub' },
			arrayFish: { type: Array, default: [] }
		},
		{
			timestamps: true
		}
	)
);
