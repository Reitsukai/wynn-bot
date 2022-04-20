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
		//backup lottery At minute 0 past every 2nd hour
		cron.schedule(
			'* * * * *',
			// '0 */2 * * *',
			async () => {
				await lotteryShedulesBackupLotteryArray(client);
			},
			{
				scheduled: true
			}
		);
		// at 18h every day
		cron.schedule(
			// '* * * * *',
			'0 18 * * *',
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
