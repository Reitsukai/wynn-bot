const fishSchema = require('../schema/fish');

module.exports.getFishByName = async function (name) {
	return await fishSchema.findOne({ name: name });
};

module.exports.getAllFish = async function () {
	return await fishSchema.find({});
};

module.exports.addNewFish = async function (name, rarity, price) {
	let fish = new fishSchema({ name: name, rarity: rarity, price: price });
	await fish.save().catch((err) => console.log(err));
	return fish;
};
