const { send } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { RandomLoadingMessage } = require('./constants');

function pickRandom(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function sendLoadingMessage(message) {
	return send(message, { embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor('#FF0000')] });
}

async function returnContentForSlashOrSendMessage(message, content) {
	if (message.type === 'APPLICATION_COMMAND') {
		return content;
	}
	return await send(message, content);
}

async function returnSlashAndMessage(message, content) {
	if (message.type === 'APPLICATION_COMMAND') {
		return await message.reply(content);
	}
	return await send(message, content);
}

module.exports.pickRandom = pickRandom;
module.exports.sendLoadingMessage = sendLoadingMessage;
module.exports.returnContentForSlashOrSendMessage = returnContentForSlashOrSendMessage;
module.exports.returnSlashAndMessage = returnSlashAndMessage;
