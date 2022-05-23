require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Fish',
	new mongoose.Schema(
		{
			id: { type: Number, unique: true },
			name: { type: String },
			rarity: { type: String },
			price: { type: Number, default: 0 },
			emoji: { type: String }
		},
		{
			timestamps: true
		}
	)
);
