exports.lotteryShedulesBackupLotteryArray = async function (client) {
	try {
		const arrayLottery = await client.db.loadArrayLottery();
		let array2, array3, array4, array5;
		for (let i = 0; i < arrayLottery.length; i++) {
			if (arrayLottery[i].lotteryType === 2) {
				array2 = arrayLottery[i];
				continue;
			}
			if (arrayLottery[i].lotteryType === 3) {
				array3 = arrayLottery[i];
				continue;
			}
			if (arrayLottery[i].lotteryType === 4) {
				array4 = arrayLottery[i];
				continue;
			}
			if (arrayLottery[i].lotteryType === 5) {
				array5 = arrayLottery[i];
				continue;
			}
		}
		for (let i = 0; i < client.options.lottery.length; i++) {
			if (client.options.lottery[i].length === 100) {
				array2.arrayBackup = client.options.lottery[i];
				continue;
			}
			if (client.options.lottery[i].length === 900) {
				array3.arrayBackup = client.options.lottery[i];
				continue;
			}
			if (client.options.lottery[i].length === 9000) {
				array4.arrayBackup = client.options.lottery[i];
				continue;
			}
			if (client.options.lottery[i].length === 90000) {
				array5.arrayBackup = client.options.lottery[i];
				continue;
			}
		}
		await Promise.all([
			client.db.saveArrayLottery(array2),
			client.db.saveArrayLottery(array3),
			client.db.saveArrayLottery(array4),
			client.db.saveArrayLottery(array5)
		]);
	} catch (e) {
		console.log(e);
	}
};
