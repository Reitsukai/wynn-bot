const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const mUser = require('../../database/schema/user');
const game = require('../../config/game');
const emoji = require('../../config/emoji');
const { saveResultGambling } = require('../../repositories/game/saveResultGambling');

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
        try {
            //init emoji, money
            const t = await fetchT(message);
            const maxBet = game.cf.max;
            const minBet = game.cf.min;
            let userInfo = await mUser
                .findOne({ discordId: message.author.id })
                .select(['money']);
            const cashUser = userInfo.money;
            //syntax check
            let money = args.next();
            let betFace = args.next();
            if (money === 'all') {
                money = cashUser < maxBet ? cashUser : maxBet;
            } else if (!isNaN(Number(money))) {
                money = Number(money);
            } else if (betFace === null) {
                betFace = money;
                money = Number(1);
            }
            //choice check
            betFace = betFace !== null ? betFace : 'heads';
            const allBetFaceStatus = ['t', 'h', 'tails', 'heads'];
            if (isNaN(money) || !allBetFaceStatus.includes(betFace)) {
                return send(message, t('commands/coin_flip:inputerror', {
                    user: message.author.tag,
                    prefix: await this.container.client.fetchPrefix(message)
                }));
            }

            if (money < minBet || money > maxBet) {
                return send(message, t('commands/coin_flip:rangeerror', {
                    user: message.author.tag,
                    min: minBet,
                    max: maxBet
                }));
            }

            if (cashUser - money < 0) {
                return send(message, t('commands/coin_flip:nomoney', {
                    user: message.author.tag
                }));
            }

            return await this.coinFlip(message, money, betFace, t);
        } catch (err) {
            this.container.logger.error(err);
        }
    }

    async coinFlip(message, bet, betFace, t) {
        const moneyEmoji = emoji.common.money;

        await send(message, t('commands/coin_flip:betting', {
            user: message.author.tag,
            bet: bet,
            emoji: moneyEmoji
        }));

        let win = null;
        let lose = null;

        let chance = Math.floor(Math.random() * 2);
        if (chance == 0 && (betFace == 'h' || betFace == 'heads')) {
            win = bet;
            await saveResultGambling(message, win, lose);
            await send(message, t('commands/coin_flip:win_heads', {
                user: message.author.tag,
                bet: win,
                betFace: betFace,
                win: (win * 2),
                emoji: moneyEmoji
            }));
        }
        else if (chance == 1 && (betFace == 'h' || betFace == 'heads')) {
            lose = bet;
            await saveResultGambling(message, win, lose);
            await send(message, t('commands/coin_flip:lose_heads', {
                user: message.author.tag,
                bet: lose,
                betFace: betFace,
                emoji: moneyEmoji
            }));
        }
        else if (chance == 0 && (betFace == 't' || betFace == 'tails')) {
            win = bet;
            await saveResultGambling(message, win, lose);
            await send(message, t('commands/coin_flip:win_tails', {
                user: message.author.tag,
                bet: win,
                betFace: betFace,
                win: (win * 2),
                emoji: moneyEmoji
            }));
        }
        else if (chance == 1 && (betFace == 't' || betFace == 'tails')) {
            lose = bet;
            await saveResultGambling(message, win, lose);
            await send(message, t('commands/coin_flip:lose_tails', {
                user: message.author.tag,
                bet: lose,
                betFace: betFace,
                emoji: moneyEmoji
            }));
        }
        return;
    }
}

exports.UserCommand = UserCommand;