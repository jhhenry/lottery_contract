const fs = require('fs')

const deployedFolder = 'deployed';
const fn = deployedFolder + '/' + 'deployed.json';

let cached;
function getContracts(web3, t) {
    if (cached) return cached;
	if (!fs.existsSync(fn)) {
		t.fail("contract deployed file does not exist.");
	}
	const fc = fs.readFileSync(fn);
	if (!fc) {
		t.fail("no content in the contract deployed file.");
	}
    const contractsInfo = JSON.parse(fc);
    const lotteryInfo = contractsInfo.lottery;
	console.log(`Got Lottery contract address ${lotteryInfo.addr}`);
	let lotteryContract = web3.eth.contract(lotteryInfo.abi);
    let lottery = lotteryContract.at(lotteryInfo.addr);

    let fileTokenContract = web3.eth.contract(contractsInfo.fileToken.abi);
    let fileToken = fileTokenContract.at(contractsInfo.fileToken.addr);

    cached = {lottery: lottery, fileToken: fileToken};
	return cached;
}

module.exports.getContracts = getContracts;
module.exports.deployedFolder = deployedFolder;
module.exports.fn = fn;