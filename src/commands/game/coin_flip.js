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

            let money = args.next();
            let betFace = args.next();
            if (money === 'all') {
                money = cashUser < maxBet ? cashUser : maxBet;
            } else {
                money = Number(money);
            }
            betFace = betFace !== null ? betFace : 'heads';
            const allBetFaceStatus = ['t', 'h', 'tails', 'heads', 'ngửa', 'úp'];
            if (!Number.isInteger(money) || !allBetFaceStatus.includes(betFace)) {
                return send(message, t('commands/coin_flip:inputerror', {
                    user: message.author.tag
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

            let { win, lose } = await this.coinFlip(message, money, betFace, t);
            await saveResultGambling(message, win, lose);
            return;
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

        const currentLanguage = await this.container.i18n.fetchLanguage(message);

        //convert
        const coinFace = {
            heads: ['heads', 'h', 'ngửa'],
            tails: ['tails', 't', 'úp']
        }
        if (currentLanguage === 'vi-VN') {
            if (coinFace.heads.includes(betFace)) betFace = 'ngửa';
            else if (coinFace.tails.includes(betFace)) betFace = 'úp';
        }
        if (currentLanguage === 'en-US') {
            if (coinFace.heads.includes(betFace)) betFace = 'heads';
            else if (coinFace.tails.includes(betFace)) betFace = 'tails';
        }

        let chance = Math.floor(Math.random() * 2);
        if (chance == 0) {
            win = bet;
            await send(message, t('commands/coin_flip:win', {
                user: message.author.tag,
                bet: win,
                betFace: betFace,
                win: (win * 2),
                emoji: moneyEmoji
            }));
        }
        else {
            lose = bet;
            await send(message, t('commands/coin_flip:lose', {
                user: message.author.tag,
                bet: lose,
                betFace: betFace,
                emoji: moneyEmoji
            }));
        }
        return {
            win: win,
            lose: lose
        };
    }
}

exports.UserCommand = UserCommand;