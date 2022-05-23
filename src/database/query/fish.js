const fishSchema = require('../schema/fish');

module.exports.getFishByName = async function (name) {
	return await fishSchema.findOne({ name: name });
};

module.exports.getAllFish = async function () {
	return await fishSchema.find({});
};

module.exports.addNewFish = async function (id, name, rarity, price, emoji) {
	let fish = new fishSchema({ id: id, name: name, rarity: rarity, price: price, emoji: emoji });
	await fish.save().catch((err) => console.log(err));
	return fish;
};
