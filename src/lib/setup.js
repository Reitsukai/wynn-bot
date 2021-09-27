require('@sapphire/plugin-logger/register');
require('@sapphire/plugin-api/register');
require('@sapphire/plugin-editable-commands/register');
require('@sapphire/plugin-i18next/register');
const { options: coloretteOptions } = require('colorette');
const { inspect } = require('util');

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
coloretteOptions.enabled = true;