const { createLogger, format, transports, addColors } = require('winston');
require('winston-daily-rotate-file');

const myCustomLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		verbose: 4,
		debug: 5,
		silly: 6
	},
	colors: {
		error: 'red',
		warn: 'yellow',
		info: 'cyan',
		http: 'green',
		verbose: 'blue',
		debug: 'red',
		silly: 'grey'
	},
};

const logger = createLogger({
	// level: 'error',
	levels: myCustomLevels.levels,
	format: format.combine(
		format.errors({ stack: true }),
		format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
		format.printf((info) => {
			const { timestamp, label, level, message, ...rest } = info;
			return format.colorize().colorize(
				level,
				`[${timestamp}][${level.toUpperCase()}]: ${message}${
					Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''
				}`
			);
		})
	),
	transports: [
		new transports.Console({}),
        new (transports.DailyRotateFile)({
			format: format.combine(format.timestamp(), format.json()),
			// level: 'error',
			filename: './logs/log-%DATE%.log',
			maxFiles: '25d'
        }),
	],
});

addColors(myCustomLevels.colors);

module.exports = logger;
