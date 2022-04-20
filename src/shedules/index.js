var cron = require('node-cron');
const { lotteryCronResult } = require('./lotteryShedulesResult');
const { lotteryCronInit } = require('./lotteryShedulesInit');
const logger = require('../utils/logger');

exports.InitCron = async function (client) {
	try {
		// every min
		// cron.schedule('*/30 * * * * *', async () => {}, {
		// 	scheduled: true
		// });
		//backup lottery
		// cron.schedule(
		// 	// '* * * * *',
		// 	async () => {
		// 		await lotteryCronInit(client);
		// 	},
		// 	{
		// 		scheduled: true
		// 	}
		// );
		// at 18h every day
		cron.schedule(
			// '* * * * *',
			'0 18 * * *',
			async () => {
				await lotteryCronInit(client);
			},
			{
				scheduled: true
			}
		);
		// at 19h every day
		cron.schedule(
			// '* * * * *',
			'0 19 * * *',
			async () => {
				await lotteryCronResult(client);
			},
			{
				scheduled: true
			}
		);
	} catch (e) {
		logger.error(e);
	}
};