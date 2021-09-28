const { Command, ok, Args } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');

class UserCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
            aliases: ['cf'],
			description: 'coin flip'
		});
	}

	async run(message, args) {
        const money = Number(args.next());
        const betFace = args.next(1);
        const allBetFaceStatus = ['t', 'h', 'tails', 'heads', 'ngửa', 'úp'];
        //config game
        if(!Number.isInteger(money) || !allBetFaceStatus.includes(betFace)){
            return message.channel.send("Input error");
        }
        if(money<0 || money>80000){
            return message.channel.send("Only in range 0 to 80000");
        }
        this.coinFlip(message, money, betFace);
        return;
	}

    async coinFlip(msg, bet, betFace) {
        const sLng = msg.guild.language;
        let win = null;
        let lose = null;
        const coinFace = {
          heads: ['heads', 'h', 'ngửa'],
          tails: ['tails', 't', 'úp']
        }
        // const gold = this.client.catEmojis.common.gold;
        // const headsIcon = this.client.catEmojis.gamble.cf.heads;
        // const tailsIcon = this.client.catEmojis.gamble.cf.tails;
        let chance = Math.floor(Math.random() * 2);
        switch ([chance, coinFace.heads.includes(betFace)].join(',')) {
          case '0,true':
            win = bet;
            await msg.channel.send(`Win ${bet * 2}!`);
            break;
          case '1,true':
            lose = bet;
            await msg.channel.send(`Lose`);
            break;
          case '0,false':
            lose = bet;
            await msg.channel.send(`Lose`);
            break;
          case '1,false':
            win = bet;
            await msg.channel.send(`Win ${bet * 2}!`);
            break;
        }
        return {
          win: win,
          lose: lose
        };
    }
}

exports.UserCommand = UserCommand;