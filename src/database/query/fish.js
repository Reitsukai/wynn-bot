const fishSchema = require('../schema/fish');

module.exports.getFishByName = async function (name) {
	return await fishSchema.findOne({ name: name });
};

module.exports.getAllFish = async function () {
	return await fishSchema.find({});
};
