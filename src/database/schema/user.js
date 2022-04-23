require('dotenv').config();
const mongoose = require('mongoose');
const roles = ['user', 'vjp', 'mod', 'owner'];

module.exports = mongoose.model(
	'User',
	new mongoose.Schema(
		{
			discordId: { type: String, unique: true },
			nickname: { type: String, default: '' },
			avatar: String,
			role: { type: String, default: 'user', enum: roles },
			sex: String,
			money: { type: Number, default: 0, index: true },
			gem: { type: Number, default: 0, index: true },
			level: { type: Number, default: 1, index: true },
			exp: { type: Number, default: 0, index: true }
		},
		{
			timestamps: true
		}
	)
);
