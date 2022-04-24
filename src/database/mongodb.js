const { fetchGuild, updateGuild } = require('./query/guild');
module.exports.fetchGuild = fetchGuild;
module.exports.updateGuild = updateGuild;

const { fetchUser, updateUser, checkExistUser, transactionItemUser, upsertUser, updateListWinner } = require('./query/user');
module.exports.fetchUser = fetchUser;
module.exports.updateUser = updateUser;
module.exports.checkExistUser = checkExistUser;
module.exports.transactionItemUser = transactionItemUser;
module.exports.upsertUser = upsertUser;
module.exports.updateListWinner = updateListWinner;

const { getDailyInfo, setDailyInfo } = require('./query/daily');
module.exports.getDailyInfo = getDailyInfo;
module.exports.setDailyInfo = setDailyInfo;

const {
	clearLotteryArray,
	initLottery,
	loadArrayLottery,
	saveArrayLottery,
	getLotteryResult,
	getLastResultLottery,
	getLotteryResultByType,
	updateCountLotteryResult,
	updateLotteryResult,
	createNewLottery,
	getListWiner,
	clearLotteryUser
} = require('./query/lottery');

module.exports.clearLotteryArray = clearLotteryArray;
module.exports.initLottery = initLottery;
module.exports.loadArrayLottery = loadArrayLottery;
module.exports.saveArrayLottery = saveArrayLottery;
module.exports.getLotteryResult = getLotteryResult;
module.exports.getLastResultLottery = getLastResultLottery;
module.exports.getLotteryResultByType = getLotteryResultByType;
module.exports.updateCountLotteryResult = updateCountLotteryResult;
module.exports.updateLotteryResult = updateLotteryResult;
module.exports.createNewLottery = createNewLottery;
module.exports.getListWiner = getListWiner;
module.exports.clearLotteryUser = clearLotteryUser;

const { fetchGuild, updateChannel } = require('./query/channel');

module.exports.fetchGuild = fetchGuild;
module.exports.updateChannel = updateChannel;
