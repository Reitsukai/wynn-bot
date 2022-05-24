require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Fish',
	new mongoose.Schema(
		{
			id: { type: Number, unique: true },
			name: { type: String },
			rarity: { type: String },
			emoji: { type: String }
		},
		{
			timestamps: true
		}
	)
);
