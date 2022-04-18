var cron = require('node-cron');
const { lotteryCronResult } = require('./lotteryShedulesResult');
const { lotteryCronInit } = require('./lotteryShedulesInit');
const logger = require('../utils/logger');

exports.InitCron = async function (client) {
	try {
		// every min
		cron.schedule('*/30 * * * * *', async () => {}, {
			scheduled: true
		});
		// at 13h every day
		cron.schedule(
			'* * * * *',
			//'0 13 * * *',
			async () => {
				console.log('abc');
				await lotteryCronInit(client);
			},
			{
				scheduled: true
			}
		);
		// at 18h every day
		// cron.schedule(
		// 	'0 18 * * *',
		// 	async () => {
		// 		await lotteryCronResult(bot);
		// 	},
		// 	{
		// 		scheduled: true
		// 	}
		// );
	} catch (e) {
		logger.error(e);
	}
};
