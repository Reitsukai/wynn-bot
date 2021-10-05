const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const mUser = require('../../database/schema/user');
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
        try {
            //init emoji, money
            const t = await fetchT(message);
            const maxBet = game.cf.max;
            const minBet = game.cf.min;
            let userInfo = await mUser
                .findOne({ discordId: message.author.id })
                .select(['money']);
            const money = Number(args.next());
            const betFace = args.next(1);
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

            if (userInfo.money - money < 0) {
                return send(message, t('commands/coin_flip:nomoney', {
                    user: message.author.tag
                }));
            }

            let { win, lose } = await this.coinFlip(message, money, betFace, t);
            // await saveBetResult(message, win, lose, 'cf');
            return;
        } catch (e) {

        }
    }

    async coinFlip(msg, bet, betFace, t) {
        const moneyEmoji = emoji.common.money;

        await send(msg, t('commands/coin_flip:betting', {
            user: msg.author.tag,
            bet: bet,
            emoji: moneyEmoji
        }));

        let win = null;
        let lose = null;
        const coinFace = {
            heads: ['heads', 'h', 'ngửa'],
            tails: ['tails', 't', 'úp']
        }

        
        let chance = Math.floor(Math.random() * 2);
        switch ([chance, coinFace.heads.includes(betFace)].join(',')) {
            case '0,true':
                win = bet;
                await send(msg, t('commands/coin_flip:win0', {
                    user: msg.author.tag,
                    bet: win,
                    win: (win * 2),
                    emoji: moneyEmoji
                }));
                break;
            case '1,true':
                lose = bet;
                await send(msg, t('commands/coin_flip:lose0', {
                    user: msg.author.tag,
                    bet: lose,
                    emoji: moneyEmoji
                }));
                break;
            case '0,false':
                lose = bet;
                await send(msg, t('commands/coin_flip:lose1', {
                    user: msg.author.tag,
                    bet: lose,
                    emoji: moneyEmoji
                }));
                break;
            case '1,false':
                win = bet;
                await send(msg, t('commands/coin_flip:win1', {
                    user: msg.author.tag,
                    bet: win,
                    win: (win * 2),
                    emoji: moneyEmoji
                }));
                break;
        }
        return {
            win: win,
            lose: lose
        };
    }
}

exports.UserCommand = UserCommand;