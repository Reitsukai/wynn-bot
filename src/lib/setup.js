require('@sapphire/plugin-logger/register');
require('@sapphire/plugin-api/register');
require('@sapphire/plugin-editable-commands/register');
require('@sapphire/plugin-i18next/register');
require('@sapphire/plugin-subcommands');
const { createColors } = require('colorette');
const { inspect } = require('util');

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
createColors(true);
