const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config({ path: './src/.env' });
const fs = require('node:fs');

const commands = [];
for (const folder of fs.readdirSync('./src/commands')) {
	if (folder.toString() === 'ownerBot') continue;
	const commandFiles = fs.readdirSync('./src/commands/' + folder.toString()).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`../commands/${folder.toString()}/${file}`);
		commands.push(command.data.toJSON()); //cannot toJSON()
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(Routes.applicationCommands(process.env.APP_ID), {
			body: commands
		});

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
