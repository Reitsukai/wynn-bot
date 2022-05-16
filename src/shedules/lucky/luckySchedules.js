exports.luckyCron = async function (client) {
	try {
		// get list result
		const result = await client.db.getLastResultLottery();
		// let listCode = new Array();
		let hset = new Set();
		for (let i = 0; i < result.length; i++) {
			for (let j = 0; j < result[i].arrayResult.length; j++) {
				// listCode.push(result[i].arrayResult[j].code % 100);
				if (!hset.has(result[i].arrayResult[j].code % 100)) {
					hset.add(result[i].arrayResult[j].code % 100);
				}
			}
		}
		// get list lucky
		const listLucky = await client.db.getAllBetLucky();
		for (const element of listLucky) {
			if (isSubset(hset, element.arrayBet)) {
				//to do
				const lengthBet = element.arrayBet.length;
				// x1 -> x27
				const moneyWinner = element.moneyBet * Math.round((19 / 7) * lengthBet * lengthBet - (10 / 12) * lengthBet);
				//noti + add money to winner
				await client.db.updateUser(element.discordId, {
					$inc: {
						money: moneyWinner
					}
				});
				client.users.fetch(element.discordId).then((user) => {
					try {
						const emoji = require('../../config/emoji');
						user.send(
							`You bet **${element.moneyBet} ${emoji.common.money}** and win **${moneyWinner} ${emoji.common.money}** from the lucky game`
						);
					} catch (err) {
						console.log('err');
					}
				});
			}
		}
	} catch (e) {
		console.log(e);
	}
};

function isSubset(hset, arr) {
	for (let i = 0; i < arr.length; i++) {
		if (!hset.has(arr[i])) return false;
	}
	return true;
}
