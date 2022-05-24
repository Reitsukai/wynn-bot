const fishSchema = require('../schema/fish');

module.exports.getFishByName = async function (name) {
	return await fishSchema.findOne({ name: name });
};

module.exports.getAllFish = async function () {
	return await fishSchema.find({});
};

module.exports.addNewFish = async function (id, name, rarity, emoji, description) {
	let fish = new fishSchema({ id: id, name: name, rarity: rarity, emoji: emoji, description: description });
	await fish.save().catch((err) => console.log(err));
	return fish;
};
