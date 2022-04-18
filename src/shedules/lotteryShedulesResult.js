exports.lotteryCronResult = async function (client) {
	try {
		let lotteryResult = await client.db.getLotteryResult();

		let arrayType2 = [],
			arrayType3 = [],
			arrayType4 = [],
			arrayType5 = [],
			id2,
			id3,
			id4,
			id5;
		for (let i = 0; i < lotteryResult.length; i++) {
			if (lotteryResult[i].typeLottery === 2) {
				arrayType2 = lotteryResult[i].arrayInit.slice();
				id2 = lotteryResult[i]._id;
			}
			if (lotteryResult[i].typeLottery === 3) {
				arrayType3 = lotteryResult[i].arrayInit.slice();
				id3 = lotteryResult[i]._id;
			}
			if (lotteryResult[i].typeLottery === 4) {
				arrayType4 = lotteryResult[i].arrayInit.slice();
				id4 = lotteryResult[i]._id;
			}
			if (lotteryResult[i].typeLottery === 5) {
				arrayType5 = lotteryResult[i].arrayInit.slice();
				id5 = lotteryResult[i]._id;
			}
		}
		let mapRes2 = new Map(),
			mapRes3 = new Map(),
			mapRes4 = new Map(),
			mapRes5 = new Map();
		/* 2x */
		// giai 7 - 4 prize - 10k
		console.log(mapRes2.size);
		while (mapRes2.size < 4) {
			mapRes2.set(arrayType2[Math.floor(Math.random() * 100)], 7);
		}
		/* 3x */
		// giai 6 - 3 prize - 20k
		while (mapRes3.size < 3) {
			mapRes3.set(arrayType3[Math.floor(Math.random() * 900)], 6);
		}
		/* 4x */
		// giai 5 - 6 prize - 40k
		while (mapRes4.size < 6) {
			mapRes4.set(arrayType4[Math.floor(Math.random() * 9000)], 5);
		}
		// giai 4 - 4 prize - 80k
		while (mapRes4.size < 10) {
			let pick = Math.floor(Math.random() * 9000);
			if (mapRes4.has(pick)) continue;
			mapRes4.set(arrayType4[pick], 4);
		}
		/* 5x */
		// giai 3 - 6 prize - 100k
		while (mapRes5.size < 6) {
			mapRes5.set(arrayType5[Math.floor(Math.random() * 90000)], 3);
		}
		// giai 2 - 2 prize - 500k
		while (mapRes5.size < 8) {
			let pick = Math.floor(Math.random() * 90000);
			if (mapRes5.has(pick)) continue;
			mapRes5.set(arrayType5[pick], 2);
		}
		// giai 1 - 1 prize - 1000k
		while (mapRes5.size < 9) {
			let pick = Math.floor(Math.random() * 90000);
			if (mapRes5.has(pick)) continue;
			mapRes5.set(arrayType5[pick], 1);
		}
		// giai DB - 1 prize - 10000k
		while (mapRes5.size < 10) {
			let pick = Math.floor(Math.random() * 90000);
			if (mapRes5.has(pick)) continue;
			mapRes5.set(arrayType5[pick], 0);
		}

		await client.db.updateLotteryResult(
			Array.from(mapRes2, ([code, prize]) => ({ code, prize })),
			id2
		);
		await client.db.updateLotteryResult(
			Array.from(mapRes3, ([code, prize]) => ({ code, prize })),
			id3
		);
		await client.db.updateLotteryResult(
			Array.from(mapRes4, ([code, prize]) => ({ code, prize })),
			id4
		);
		await client.db.updateLotteryResult(
			Array.from(mapRes5, ([code, prize]) => ({ code, prize })),
			id5
		);
	} catch (e) {
		console.log(e);
	}
};
