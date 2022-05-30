module.exports = {
	fishing: {
		buy: 100,
		allelement: ['frog', 'eel', 'carp', 'shark', 'whale', 'crocodile', 'squid', 'kraken', 'mermaid'],
		tub: [{ rate: 1, name: 'frog' }],
		lake: [
			{ rate: 0.45, name: 'frog' },
			{ rate: 0.9, name: 'eel' },
			{ rate: 1, name: 'fail' }
		],
		river: [
			{ rate: 0.5, name: 'frog' },
			{ rate: 0.75, name: 'carp' },
			{ rate: 0.85, name: 'crocodile' },
			{ rate: 1, name: 'fail' }
		],
		sea: [
			{ rate: 0.25, name: 'eel' },
			{ rate: 0.6, name: 'squid' },
			{ rate: 0.72, name: 'shark' },
			{ rate: 0.78, name: 'crocodile' },
			{ rate: 0.8, name: 'whale' },
			{ rate: 0.80005, name: 'kraken' },
			{ rate: 0.800051, name: 'mermaid' },
			{ rate: 1, name: 'fail' }
		]
	}
};
