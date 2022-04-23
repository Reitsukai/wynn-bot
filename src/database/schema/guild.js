require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Guild',
	new mongoose.Schema({
		id: { type: String }, // ID of the guild
		registeredAt: { type: Number, default: Date.now() },
		prefix: { type: String, default: process.env.PREFIX },
		language: { type: String, default: 'en-US' }
	})
);
