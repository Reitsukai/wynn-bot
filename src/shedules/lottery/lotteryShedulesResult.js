exports.lotteryCronResult = async function (client) {
	const game = require('../../config/game');
	try {
		let lotteryResult = await client.db.getLotteryResult();

		let id2, id3, id4, id5;
		for (let i = 0; i < lotteryResult.length; i++) {
			if (lotteryResult[i].lotteryType === 2) {
				id2 = lotteryResult[i]._id;
			}
			if (lotteryResult[i].lotteryType === 3) {
				id3 = lotteryResult[i]._id;
			}
			if (lotteryResult[i].lotteryType === 4) {
				id4 = lotteryResult[i]._id;
			}
			if (lotteryResult[i].lotteryType === 5) {
				id5 = lotteryResult[i]._id;
			}
		}
		let giai7 = [],
			giai6 = [],
			giai5 = [],
			giai4 = [],
			giai3 = [],
			giai2 = [],
			giai1 = [],
			giaidb = [];
		/* 2x */
		// giai 7 - 4 prize - 10k
		while (giai7.length < 4) {
			giai7.push({ code: Math.floor(Math.random() * 100), prize: 7 });
		}
		/* 3x */
		// giai 6 - 3 prize - 20k
		while (giai6.length < 3) {
			giai6.push({ code: Math.floor(Math.random() * 900) + 100, prize: 6 });
		}
		/* 4x */
		// giai 5 - 6 prize - 40k
		while (giai5.length < 6) {
			giai5.push({ code: Math.floor(Math.random() * 9000) + 1000, prize: 5 });
		}
		// giai 4 - 4 prize - 80k
		while (giai4.length < 4) {
			giai4.push({ code: Math.floor(Math.random() * 9000) + 1000, prize: 4 });
		}
		/* 5x */
		// giai 3 - 6 prize - 100k
		while (giai3.length < 6) {
			giai3.push({ code: Math.floor(Math.random() * 90000) + 10000, prize: 3 });
		}
		// giai 2 - 2 prize - 500k
		while (giai2.length < 2) {
			giai2.push({ code: Math.floor(Math.random() * 90000) + 10000, prize: 2 });
		}
		// giai 1 - 1 prize - 1000k
		while (giai1.length < 1) {
			giai1.push({ code: Math.floor(Math.random() * 90000) + 10000, prize: 1 });
		}
		// giai DB - 1 prize - 10000k
		while (giaidb.length < 1) {
			giaidb.push({ code: Math.floor(Math.random() * 90000) + 10000, prize: 0 });
		}

		await Promise.all([
			getListAndReward(client, giai7, game.lottery.seventh),
			getListAndReward(client, giai6, game.lottery.sixth),
			getListAndReward(client, giai5, game.lottery.fifth),
			getListAndReward(client, giai4, game.lottery.fourth),
			getListAndReward(client, giai3, game.lottery.third),
			getListAndReward(client, giai2, game.lottery.second),
			getListAndReward(client, giai1, game.lottery.fisrt),
			getListAndReward(client, giaidb, game.lottery.special)
		]);
		//clear collection
		await client.db.clearLotteryUser();
		await Promise.all([
			client.db.updateLotteryResult(giai7, id2),
			client.db.updateLotteryResult(giai6, id3),
			client.db.updateLotteryResult(giai4.concat(giai5), id4),
			client.db.updateLotteryResult(giaidb.concat(giai1).concat(giai2).concat(giai3), id5)
		]);
	} catch (e) {
		console.log(e);
	}
};

async function getListAndReward(client, giaiList, reward) {
	let listWinner = await client.db.getListWiner(
		giaiList.map(function (obj) {
			return obj.code;
		})
	);
	return await client.db.updateListWinner(
		listWinner.map(function (obj) {
			return obj.discordId;
		}),
		reward
	);
}
