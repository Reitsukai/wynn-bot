const mUser = require('../../database/schema/user');

exports.saveResultGambling = async (message, win, lose) => {
	try {
		if (win != null) {
			return await mUser.updateOne(
				{ discordId: message.author.id },
				{
					$inc: {
						money: win
					}
				}
			);
		}
		return await mUser.updateOne(
			{ discordId: message.author.id },
			{
				$inc: {
					money: -lose
				}
			}
		);
	} catch (err) {
		this.container.logger.error(err);
	}
};
