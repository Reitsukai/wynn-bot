var cron = require('node-cron');
const { lotteryCronResult } = require('./lottery/lotteryShedulesResult');
const { lotteryCronInit } = require('./lottery/lotteryShedulesInit');
const { lotteryShedulesBackupLotteryArray } = require('./lottery/lotteryShedulesBackupLotteryArray');
const logger = require('../utils/logger');

exports.InitCron = async function (client) {
	try {
		// every min
		// cron.schedule('*/30 * * * * *', async () => {}, {
		// 	scheduled: true
		// });
		//backup lottery At :30 in every 2nd hour from 1am through 11pm
		cron.schedule(
			// '* * * * *',
			'30 1-23/2 * * *',
			async () => {
				await lotteryShedulesBackupLotteryArray(client);
				//clear cooldown
				client.options.timeouts.clear();
			},
			{
				scheduled: true
			}
		);
		// at 18h every day - GMT+7
		// GMT + 0 : 11h
		cron.schedule(
			// '* * * * *',
			'0 11 * * *',
			async () => {
				await lotteryCronResult(client);
				await lotteryCronInit(client);
			},
			{
				scheduled: true
			}
		);
	} catch (e) {
		logger.error(e);
	}
};
