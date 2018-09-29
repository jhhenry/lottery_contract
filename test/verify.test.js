const test = require('ava');
const web3 = require('./web3Utils')
const txnUtils = require('./txnUtils.js');
const deployInfo = require('./deployInfo');

var accounts = web3.eth.accounts
var lottery_issuer = accounts[0];
let lottery_winner = accounts[1];
test.before("initialize a existing lottery contract", async t => {
	let lottery = deployInfo.getLottery(web3, t);
	t.context.lottery = lottery;
});

test("verify test", async t => {
	let lottery = t.context.lottery;
	t.truthy(lottery);
	
	let lotteryData = "0x001E6c4c3d32407621297459773731385424646f5b7c62292a6d2e39255b4d2e21e765a9a9dfebcbe94d520a2bb225cfc9c8345f330a9dd1e987b8b14d0638307c8c7a481a3dac2431745ce9b18b3bb8b6c526e7000001659a693424";
	//console.log(`lotteryData: ${lotteryData}`);
	let sig = "0x393f2778c4f908edbb6c456960fecc877d57c5e3b5c85e06601e30cb601481c6517400aef340363cefee5f38f6fdfc082ff1b0945ca7465ae0a2e814b97173211c";
	let rs1 = "0x5b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c";
	let verify_txn = lottery.verify(lotteryData, sig, rs1, {from:lottery_issuer, gas:300000});
	console.log(`verify_txn: ${verify_txn}`);
	await txnUtils.getReceiptPromise(web3, verify_txn, 60);
	console.log(`Has got the receipt of verify_txn: ${verify_txn}`);
	await txnUtils.retryPromise(
		() => {
			let afterVerify = lottery.getEscrow(lottery_issuer);
			console.log(`afterVerify: ${afterVerify}`);
			return web3.fromWei(afterVerify, "ether").toNumber() < 10;
		},
		15);
	let winner_balance = lottery.getEscrow(lottery_winner);
	t.is(web3.fromWei(winner_balance, "finney").toNumber(), 10, "Winner did not get rewarded.");
})