const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const mUser = require('../../database/schema/user');
const game = require('../../config/game');
const emoji = require('../../config/emoji');
const { saveResultGambling } = require('../../repositories/game/saveResultGambling');
const { MessageEmbed } = require('discord.js');

class UserCommand extends WynnCommand {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'baucua',
            aliases: ['bc', 'baucua'],
            description: 'commands/baucua:description',
            usage: 'commands/baucua:usage',
            example: 'commands/baucua:example',
            cooldownDelay: 5000
        });
    }

    async run(message, args) {
        try {
            //init emoji, money
            const t = await fetchT(message);
            const maxBet = game.baucua.max;
            const minBet = game.baucua.min;
            let userInfo = await mUser.findOne({ discordId: message.author.id }).select(['money']);
            const cashUser = userInfo.money;
            //syntax check
            let money = Number(args.next());

            if (isNaN(money)) {
                return send(
                    message,
                    t('commands/baucua:inputerror', {
                        user: message.author.tag,
                        prefix: await this.container.client.fetchPrefix(message)
                    })
                );
            }

            if (money < minBet || money > maxBet) {
                return send(
                    message,
                    t('commands/baucua:rangeerror', {
                        user: message.author.tag,
                        min: minBet,
                        max: maxBet
                    })
                );
            }

            if (cashUser - money < 0) {
                return send(
                    message,
                    t('commands/baucua:nomoney', {
                        user: message.author.tag
                    })
                );
            }

            const moneyEmoji = emoji.common.money;
            const dices = {
                bau: emoji.game.baucua.bau,
                cua: emoji.game.baucua.cua,
                ca: emoji.game.baucua.ca,
                ga: emoji.game.baucua.ga,
                tom: emoji.game.baucua.tom,
                nai: emoji.game.baucua.nai
            };
            const dice_icon = emoji.game.baucua.dice;
            const cancel = emoji.common.tick_x;
            let numOfBet = [0, 0, 0, 0, 0, 0];
            //create message
            let newMsg = await send(message, { embeds: [createBetMessage(message, money, dices, moneyEmoji, t)] });
            await Promise.all([
                newMsg.react(dice_icon),
                newMsg.react(cancel),
                newMsg.react(dices.bau),
                newMsg.react(dices.cua),
                newMsg.react(dices.ca),
                newMsg.react(dices.ga),
                newMsg.react(dices.tom),
                newMsg.react(dices.nai)
            ]);
            //bet and result
            const filter = (reaction, user) => {
                return [dice_icon, cancel, dices.bau, dices.cua, dices.ca, dices.ga, dices.tom, dices.nai].includes(reaction.emoji.name)
                    && user.id === message.author.id;
            };

            const collector = newMsg.createReactionCollector({ filter, time: 40000 });
            collector.on('collect', async (reaction, user) => {
                let status = 0;
                if (reaction.emoji.name === cancel) { //cancel thì hoàn tiền
                    await saveResultGambling(message, numOfBet.reduce(function (a, b) { return a + b; }, 0), null);
                    collector.stop();
                    await newMsg.delete();
                } else if (reaction.emoji.name === dice_icon) { //quay
                    await Promise.all([
                        collector.stop(),
                        newMsg.reactions.removeAll()
                    ]);
                    let bet = 0;
                    let win = null;
                    let lose = null;
                    for (var i in numOfBet) { bet += numOfBet[i]; }
                    let randDices = [];
                    while (randDices.length < 3) {
                        randDices.push(Math.floor(Math.random() * 6));
                    }
                    win = numOfBet[randDices[0]] * 2 + numOfBet[randDices[1]] * 2 + numOfBet[randDices[2]] * 2;
                    //TH ra giống nhau
                    if (randDices[0] == randDices[1] || randDices[0] == randDices[2]) win -= numOfBet[randDices[0]];
                    if (randDices[1] == randDices[2]) win -= numOfBet[randDices[1]];
                    if (win < bet) {
                        lose = bet - win;
                        win = null;
                    }
                    await saveResultGambling(message, win, lose - bet);
                    let resultMsg = createResultMessage(message, bet, win, lose, randDices, dices, numOfBet, moneyEmoji, t);
                    await newMsg.edit({ embeds: [resultMsg] });
                } else { //thay doi
                    await saveResultGambling(message, null, money);
                    switch (reaction.emoji.name) {
                        case dices.bau:
                            numOfBet[0] += money;
                            status = 0;
                            break;
                        case dices.cua:
                            numOfBet[1] += money;
                            status = 1;
                            break;
                        case dices.ca:
                            numOfBet[2] += money;
                            status = 2;
                            break;
                        case dices.ga:
                            numOfBet[3] += money;
                            status = 3;
                            break;
                        case dices.tom:
                            numOfBet[4] += money;
                            status = 4;
                            break;
                        case dices.nai:
                            numOfBet[5] += money;
                            status = 5;
                            break;
                    }
                    await reaction.users.remove(message.author.id);
                    userInfo = await mUser
                        .findOne({ discordId: message.author.id })
                        .select(['money']).lean();
                    //check money
                    if (userInfo.money < 0) {
                        numOfBet[status] -= money; //reset ve trang thai cu
                        await saveResultGambling(message, money, null);
                        let processMsg = editProcessMessage(message, dices, numOfBet, t, 'warn');
                        await newMsg.edit({ embeds: [processMsg] });
                    } else {
                        let processMsg = editProcessMessage(message, dices, numOfBet, t, null);
                        await newMsg.edit({ embeds: [processMsg] });
                    }
                }
            });
            return;
        } catch (err) {
            this.container.logger.error(err);
        }
    }


}

function createBetMessage(message, bet, dices, moneyEmoji, t) {
    return new MessageEmbed()
        .setTitle(t('commands/baucua:title'))
        .setDescription(t('commands/baucua:descrp', { author: message.author.tag }))
        .addFields(
            { name: t('commands/baucua:bau', { emo: dices.bau }), value: '0', inline: true },
            { name: t('commands/baucua:cua', { emo: dices.cua }), value: '0', inline: true },
            { name: t('commands/baucua:ca', { emo: dices.ca }), value: '0', inline: true },
            { name: t('commands/baucua:ga', { emo: dices.ga }), value: '0', inline: true },
            { name: t('commands/baucua:tom', { emo: dices.tom }), value: '0', inline: true },
            { name: t('commands/baucua:nai', { emo: dices.nai }), value: '0', inline: true },
        )
        .addField('=======================================',
            t('commands/baucua:footer', {
                bet: bet,
                emoji: moneyEmoji
            })
        );
}

function editProcessMessage(message, dices, numOfBet, t, warn) {
    const warnFooter = "======================================";
    if (warn === 'warn') warnFooter = t('commands/coin_flip:nomoney', { user: message.author.tag });
    return new MessageEmbed()
        .setTitle(t('commands/baucua:title'))
        .setDescription(t('commands/baucua:descrp', { author: message.author.tag }))
        .addFields(
            { name: t('commands/baucua:bau', { emo: dices.bau }), value: numOfBet[0].toString(), inline: true },
            { name: t('commands/baucua:cua', { emo: dices.cua }), value: numOfBet[1].toString(), inline: true },
            { name: t('commands/baucua:ca', { emo: dices.ca }), value: numOfBet[2].toString(), inline: true },
            { name: t('commands/baucua:ga', { emo: dices.ga }), value: numOfBet[3].toString(), inline: true },
            { name: t('commands/baucua:tom', { emo: dices.tom }), value: numOfBet[4].toString(), inline: true },
            { name: t('commands/baucua:nai', { emo: dices.nai }), value: numOfBet[5].toString(), inline: true },
        )
        .addField('=======================================', warnFooter);
}

function convertEmoji(x, dices) {
    if (x == 0) return dices.bau;
    if (x == 1) return dices.cua;
    if (x == 2) return dices.ca;
    if (x == 3) return dices.ga;
    if (x == 4) return dices.tom;
    if (x == 5) return dices.nai;
}

function createResultMessage(message, bet, win, lose, randDices, dices, numOfBet, moneyEmoji, t) {
    if (win != null) {
        return new MessageEmbed()
            .setColor(0x78be5a)
            .setTitle(t('commands/baucua:title'))
            .addFields(
                { name: t('commands/baucua:bau', { emo: dices.bau }), value: numOfBet[0].toString(), inline: true },
                { name: t('commands/baucua:cua', { emo: dices.cua }), value: numOfBet[1].toString(), inline: true },
                { name: t('commands/baucua:ca', { emo: dices.ca }), value: numOfBet[2].toString(), inline: true },
                { name: t('commands/baucua:ga', { emo: dices.ga }), value: numOfBet[3].toString(), inline: true },
                { name: t('commands/baucua:tom', { emo: dices.tom }), value: numOfBet[4].toString(), inline: true },
                { name: t('commands/baucua:nai', { emo: dices.nai }), value: numOfBet[5].toString(), inline: true },
            )
            .addField('=======================================',
                t('commands/baucua:win', {
                    author: message.author.tag,
                    icon1: convertEmoji(randDices[0], dices),
                    icon2: convertEmoji(randDices[1], dices),
                    icon3: convertEmoji(randDices[2], dices),
                    bet: bet,
                    emoji: moneyEmoji,
                    win: win
                })
            );
    }
    return new MessageEmbed()
        .setColor(0xff0000)
        .setTitle(t('commands/baucua:title'))
        .addFields(
            { name: t('commands/baucua:bau', { emo: dices.bau }), value: numOfBet[0].toString(), inline: true },
            { name: t('commands/baucua:cua', { emo: dices.cua }), value: numOfBet[1].toString(), inline: true },
            { name: t('commands/baucua:ca', { emo: dices.ca }), value: numOfBet[2].toString(), inline: true },
            { name: t('commands/baucua:ga', { emo: dices.ga }), value: numOfBet[3].toString(), inline: true },
            { name: t('commands/baucua:tom', { emo: dices.tom }), value: numOfBet[4].toString(), inline: true },
            { name: t('commands/baucua:nai', { emo: dices.nai }), value: numOfBet[5].toString(), inline: true },
        )
        .addField('=======================================',
            t('commands/baucua:lose', {
                author: message.author.tag,
                icon1: convertEmoji(randDices[0], dices),
                icon2: convertEmoji(randDices[1], dices),
                icon3: convertEmoji(randDices[2], dices),
                bet: bet,
                emoji: moneyEmoji,
                lose: lose
            })
        );
}

exports.UserCommand = UserCommand;
