const fs = require('fs')
const web3 = require('./web3Utils');
const txnUtils = require('./txnUtils');
const deployInfo = require('./deployInfo');
const compile = require('./compile');

const deployedFolder = deployInfo.deployedFolder;
const fn = deployInfo.fn;

/* create the 'deployed' folder */
if (!fs.existsSync(deployedFolder)) {
	fs.mkdirSync(deployedFolder);
}

if (fs.existsSync(fn)) {
	fs.unlinkSync(fn);
}

/* compile the latest Lottery contract. */
let abi, bytecode;
({abi, bytecode} = compile.compileLotteryContract());
let lotteryAbi = abi;

deloyLotteryContract();


function deloyLotteryContract() {
	console.log('Start deploying the lottery contract...');
	const accounts = web3.eth.accounts;
	for (let acc of accounts) {
		web3.personal.unlockAccount(acc, 'highsharp', 36000);
	}
	console.log("Initialing a new contract...");
	
	lotteryContract = web3.eth.contract(lotteryAbi);
	lottery = lotteryContract.new(
		{
			from: web3.eth.accounts[0],
			data: bytecode,
			gas: '4700000'
		}, function (e, contract) {
			//console.log(e, contract);
			if(e) throw e;
			console.log("Creating the contract callback.");
			if (typeof contract.address !== 'undefined') {
				console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
				fs.appendFile(fn, JSON.stringify({abi: lotteryAbi, addr: contract.address}), err => {
					if (err) throw err;
					console.log("Written addr to the delpoyed file.")
				})
				var accounts = web3.eth.accounts
				increaseEscrow(accounts[0]);
				increaseEscrow(accounts[2]);
			}
		});
}

async function increaseEscrow(acc)
{
	const initE = lottery.getEscrow(acc);
	const txn = lottery.increase({from: acc, value: web3.toWei('10', 'ether')});
	const r =  await txnUtils.getReceiptPromise(web3, txn, 60);
	console.log(`txn: ${txn}, r: ${r}`);

	const gap =  await txnUtils.retryPromise(
		() => {
			let e2 = lottery.getEscrow(acc);
			console.log(`e2: ${e2}`);
			return web3.fromWei(e2.minus(initE), "ether").toNumber() === 10;
		},
		15);
	if (!gap) {
		console.error("Failed to increase escrow for account 1 during deploy.");
	}
}

