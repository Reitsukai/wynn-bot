const { SapphireClient, container } = require('@sapphire/framework');
const Discord = require('discord.js');
const { createCaptcha } = require('../../utils/index');

async function fetchPrefix(message) {
	if (message.guild === null) return process.env.PREFIX;
	const guild = await this.db.fetchGuild(message.guild.id);
	return guild.prefix;
}

async function checkTimeCoolDown(id, name, delay, t) {
	if (process.env.OWNER_IDS.split(',').includes(id)) {
		return;
	}
	const getTimeout = container.client.options.timeouts.get(`${id}_${name}`) || 0;
	if (Date.now() - getTimeout < 0) {
		return t('preconditions:preconditionCooldown', {
			remaining: `\`${(getTimeout - Date.now()) / 1000}s\``
		});
	}
	container.client.options.timeouts.set(`${id}_${name}`, Date.now() + (delay || 0));
}

async function checkTimeCoolDownWithCheckSpam(id, name, delay, t) {
	if (process.env.OWNER_IDS.split(',').includes(id)) {
		return;
	}
	let countSpam = container.client.options.spams.get(`${id}`) || 0;
	if (countSpam > 22) {
		//sent captcha
		return await createCaptcha(true);
	} else {
		countSpam++;
		container.client.options.spams.set(`${id}`, countSpam);
	}
	const getTimeout = container.client.options.timeouts.get(`${id}_${name}`) || 0;
	if (Date.now() - getTimeout < 0) {
		return t('preconditions:preconditionCooldown', {
			remaining: `\`${(getTimeout - Date.now()) / 1000}s\``
		});
	}
	container.client.options.timeouts.set(`${id}_${name}`, Date.now() + (delay || 0));
}

async function resetCooldown(idUser, command) {
	let mapCooldown = container.stores.get('preconditions').get('Cooldown').buckets.get(command);
	let valueOfCooldown = mapCooldown.get(idUser);
	valueOfCooldown.expires = Date.now() + 5000;
	return mapCooldown.set(idUser, valueOfCooldown);
	// console.log(mapCooldown.get('662508642251309057'));
}

async function resetCustomCooldown(id, name) {
	return container.client.options.timeouts.set(`${id}_${name}`, Date.now() + 8000);
}

async function loadArrayLottery() {
	const arrayLottery = await this.db.loadArrayLottery();
	//server go off load backup
	for (let i = 0; i < arrayLottery.length; i++) {
		if (arrayLottery[i].arrayBackup.length > 0) {
			container.client.options.lottery.push(arrayLottery[i].arrayBackup);
		} else {
			container.client.options.lottery.push(arrayLottery[i].arrayInit);
		}
	}
}

async function setArrayLottery(arrayType2, arrayType3, arrayType4, arrayType5) {
	container.client.options.lottery = [];
	container.client.options.lottery.push(arrayType2);
	container.client.options.lottery.push(arrayType3);
	container.client.options.lottery.push(arrayType4);
	container.client.options.lottery.push(arrayType5);
}

class WynnClient extends SapphireClient {
	constructor(options) {
		super({
			...options,
			i18n: {
				defaultMissingKey: 'missing',
				defaultNS: 'default',
				i18next: {
					preload: ['en-US', 'vi-VN'],
					load: 'currentOnly',
					lowerCaseLng: false,
					fallbackLng: 'en-US',
					initImmediate: false,
					interpolation: {
						escapeValue: false
					}
				},
				fetchLanguage: async ({ guild }) => {
					if (guild) {
						const guildConfig = await this.db.fetchGuild(guild.id);
						return guildConfig.language;
					}

					return 'en-US';
				}
			},
			timeouts: new Discord.Collection(),
			spams: new Discord.Collection(),
			lottery: new Array()
		});
		this.db = require('./../../database/mongodb');

		this.fetchPrefix = fetchPrefix.bind(this);
		//cooldown
		this.checkTimeCoolDown = checkTimeCoolDown.bind(this);
		this.checkTimeCoolDownWithCheckSpam = checkTimeCoolDownWithCheckSpam.bind(this);
		this.resetCooldown = resetCooldown.bind(this);
		this.resetCustomCooldown = resetCustomCooldown.bind(this);
		//cache array lottery
		this.loadArrayLottery = loadArrayLottery.bind(this);
		this.setArrayLottery = setArrayLottery.bind(this);
	}
}
module.exports = WynnClient;
