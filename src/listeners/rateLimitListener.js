const { Listener } = require('@sapphire/framework');
const { logger } = require('../utils/index');
require('dotenv').config({ path: './src/.env' });

class RateLimitListener extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: false,
			event: 'rateLimit'
		});
	}

	run(timeout, limit) {
		this.container.client.users.fetch(process.env.OWNER_IDS.split(',')[0]).then((user) => {
			try {
				user.send(`Timeout : ${timeout}ms\nLimit : ${limit} requests`);
			} catch (err) {
				console.log('err');
			}
		});
		logger.warn(`Timeout : ${timeout}ms\nLimit : ${limit} requests`);
		this.container.client.logger.info(`Timeout : ${timeout}ms\nLimit : ${limit} requests`);
	}
}

module.exports = {
	RateLimitListener
};
