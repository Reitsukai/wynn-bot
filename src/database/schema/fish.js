require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Fish',
	new mongoose.Schema(
		{
			name: { type: String },
			rarity: { type: String },
			price: { type: Number, default: 0 }
		},
		{
			timestamps: true
		}
	)
);
