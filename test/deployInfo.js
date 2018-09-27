const fs = require('fs')

const deployedFolder = 'deployed';
const fn = deployedFolder + '/' + 'deployed.json';
function getLottery(web3, t) {
	if (!fs.existsSync(fn)) {
		t.fail("contract deployed file does not exist.");
	}
	const fc = fs.readFileSync(fn);
	if (!fc) {
		t.fail("no content in the contract deployed file.");
	}
	const contractInfo = JSON.parse(fc);
	var jsonInterface = contractInfo.abi; //[{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"lottery","type":"bytes"}],"name":"splitLottery","outputs":[{"name":"ver","type":"bytes1"},{"name":"rs2","type":"bytes"},{"name":"hashRs1","type":"bytes32"},{"name":"addr","type":"address"},{"name":"time","type":"uint64"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"unLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"getEscrow","outputs":[{"name":"deposite","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"ver","type":"uint8"},{"name":"hashRs1Rs2","type":"bytes32"},{"name":"rs2","type":"bytes"}],"name":"verifyLottery","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"lottery","type":"bytes"},{"name":"signature","type":"bytes"},{"name":"winningData","type":"bytes"}],"name":"verify","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"increase","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"withdrawAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"lottery","type":"bytes"},{"indexed":false,"name":"sig","type":"bytes"},{"indexed":false,"name":"winningData","type":"bytes"},{"indexed":false,"name":"sender","type":"address"}],"name":"VerifyLottery","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"lottery","type":"bytes"},{"indexed":false,"name":"issuingTime","type":"uint64"},{"indexed":false,"name":"faceValue","type":"uint256"},{"indexed":false,"name":"issuer","type":"address"},{"indexed":false,"name":"winner","type":"address"}],"name":"RedeemedLotttery","type":"event"}]
	console.log(`Got contract info ${contractInfo.addr}`);
	let lotteryContract = web3.eth.contract(jsonInterface);
	let lottery = lotteryContract.at(contractInfo.addr);
	return lottery;
}

module.exports.getLottery = getLottery;
module.exports.deployedFolder = deployedFolder;
module.exports.fn = fn;