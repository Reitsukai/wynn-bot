require('dotenv').config({ path: './src/.env' });

const { BKU_FOLDER, DB_NAME, DB_ADDRESS, DB_USER, DB_PASSWORD } = process.env;

exports.mongoBackup = async function () {
	console.log('Start backup database ... ');
};
