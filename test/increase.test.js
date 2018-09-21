const test = require('ava');
import txnUtils from './txnUtils.js'
const isNullOrUndefined = require('util').isNullOrUndefined;
const web3 = require('./web3Utils')
var accounts = web3.eth.accounts
var lottery_issuer = accounts[0];
//var lottery_redeemer = accounts[1];

test.before("initialize a existing lottery contract", t => {
	var jsonInterface = [{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"lottery","type":"bytes"}],"name":"splitLottery","outputs":[{"name":"ver","type":"bytes1"},{"name":"rs2","type":"bytes"},{"name":"hashRs1","type":"bytes32"},{"name":"addr","type":"address"},{"name":"time","type":"uint64"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"unLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"getEscrow","outputs":[{"name":"deposite","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"ver","type":"uint8"},{"name":"hashRs1Rs2","type":"bytes32"},{"name":"rs2","type":"bytes"}],"name":"verifyLottery","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"lottery","type":"bytes"},{"name":"signature","type":"bytes"},{"name":"winningData","type":"bytes"}],"name":"verify","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"increase","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"withdrawAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"lottery","type":"bytes"},{"indexed":false,"name":"sig","type":"bytes"},{"indexed":false,"name":"winningData","type":"bytes"},{"indexed":false,"name":"sender","type":"address"}],"name":"VerifyLottery","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"lottery","type":"bytes"},{"indexed":false,"name":"issuingTime","type":"uint64"},{"indexed":false,"name":"faceValue","type":"uint256"},{"indexed":false,"name":"issuer","type":"address"},{"indexed":false,"name":"winner","type":"address"}],"name":"RedeemedLotttery","type":"event"}];
	var lotteryContract = web3.eth.contract(jsonInterface);
	var lottery = lotteryContract.at("0x242a56af95e1092c28c38e2ce27d3d7825c89a02");
	t.true(!isNullOrUndefined(lottery), "lottery should not be null.")

	for (let acc of accounts) {
		t.true(web3.personal.unlockAccount(acc, 'highsharp', 36000), 'failed to unlock account ${acc}');
	}
	t.context.lottery = lottery;
});

test('test increase and then getEscrow', async t => {
	const lottery = t.context.lottery;
	const txn = lottery.increase({from: lottery_issuer, value: web3.toWei('10', 'ether')});
	const r =  await txnUtils.getReceiptPromise(web3, txn, 60);
	//console.log(`r: ${r}`);
	t.true(!isNullOrUndefined(r), `The receipt of ${txn} should not be null.`);
});

test('bar', async t => {
	const bar = Promise.resolve('bar');

	t.is(await bar, 'bar');
});