const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const game = require('../../config/game');
const emoji = require('../../config/emoji');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'coin_flip',
			aliases: ['cf', 'coin_flip'],
			description: 'commands/coin_flip:description',
			usage: 'commands/coin_flip:usage',
			example: 'commands/coin_flip:example',
			cooldownDelay: 20000
		});
	}

	async run(message, args) {
		const t = await fetchT(message);
		const userInfo = await this.container.client.db.fetchUser(message.author.id);

		const first = await args.pick('string').catch(() => null);
		const next = (await args.next()) || undefined;

		const betFaces = ['h', 'heads', 't', 'tails'];
		let betFace, betMoney;

		if (!Number.isNaN(Number(first))) {
			betMoney = Number(first);
			betFace = next || 'heads';
		} else if (first === 'all') {
			betMoney = userInfo.money > game.cf.max ? game.cf.max : userInfo.money;
			betFace = next || 'heads';
		} else {
			betFace = first;
			betMoney = next ? (next === 'all' ? game.cf.max : Number.isNaN(Number(next)) ? undefined : Number(next)) : game.cf.min;
		}

		if (!betFaces.includes(betFace) || !betMoney) {
			return send(
				message,
				t('commands/coin_flip:inputerror', {
					user: message.author.tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}

		if (betMoney < game.cf.min || betMoney > game.cf.max) {
			return send(
				message,
				t('commands/coin_flip:rangeerror', {
					user: message.author.tag,
					min: game.cf.min,
					max: game.cf.max
				})
			);
		}

		if (userInfo.money - betMoney < 0) {
			return send(
				message,
				t('commands/coin_flip:nomoney', {
					user: message.author.tag
				})
			);
		}

		const flip = (face) => {
			const faces = { 0: { value: 'heads', aliases: ['h', 'heads'] }, 1: { value: 'tails', aliases: ['t', 'tails'] } };
			const chance = Math.floor(Math.random() * 2);

			return {
				result: faces[chance].aliases.includes(face),
				value: faces[chance].value,
				bet: Object.values(faces).find((item) => item.aliases.includes(face)).value
			};
		};

		const { result, value, bet } = flip(betFace);

		await send(
			message,
			t('commands/coin_flip:betting', {
				user: message.author.tag,
				bet: betMoney,
				emoji: emoji.common.money,
				face: t(`commands/coin_flip:${bet}`)
			})
		);
		try {
			await this.container.client.db.updateUser(message.author.id, {
				$inc: {
					money: result ? betMoney : -betMoney
				}
			});

			await send(
				message,
				t('commands/coin_flip:result', {
					user: message.author.tag,
					money: betMoney,
					status: result ? t('commands/coin_flip:win') : t('commands/coin_flip:lost'),
					value: t(`commands/coin_flip:${value}`),
					face: t(`commands/coin_flip:${bet}`),
					emoji: emoji.common.money,
					result: result ? betMoney * 2 : betMoney
				})
			);
		} catch {
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
