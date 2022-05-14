exports.luckyCron = async function (client) {
	try {
		let lotteryResult = await client.db.getLotteryResult();

		console.log(lotteryResult);
	} catch (e) {
		console.log(e);
	}
};
