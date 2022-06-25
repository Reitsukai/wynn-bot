module.exports = {
	fishing: {
		buy: 100,
		allelement: ['frog', 'eel', 'carp', 'shark', 'whale', 'crocodile', 'squid', 'kraken', 'mermaid', 'cá 3 tủi'],
		special: ['cá 3 tủi'],
		tub: [{ rate: 1, name: 'frog' }],
		lake: [
			{ rate: 0.45, name: 'frog' },
			{ rate: 0.9, name: 'eel' },
			{ rate: 0.92, name: 'cá 3 tủi' },
			{ rate: 1, name: 'fail' }
		],
		river: [
			{ rate: 0.6, name: 'frog' },
			{ rate: 0.75, name: 'carp' },
			{ rate: 0.85, name: 'crocodile' },
			{ rate: 1, name: 'fail' }
		],
		sea: [
			{ rate: 0.38, name: 'eel' },
			{ rate: 0.74, name: 'squid' },
			{ rate: 0.77, name: 'shark' }, // 0.03
			{ rate: 0.79, name: 'crocodile' }, // 0.02
			{ rate: 0.8, name: 'whale' }, // 0.01
			{ rate: 0.800005, name: 'kraken' },
			{ rate: 0.8000051, name: 'mermaid' },
			{ rate: 1, name: 'fail' }
		]
	}
};
