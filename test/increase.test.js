const test = require('ava');
const txnUtils = require('./txnUtils');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
var accounts = web3.eth.accounts
var lottery_issuer = accounts[2];
test.before("initialize a existing lottery contract", t => {
	let lottery = deployInfo.getLottery(web3, t);
	t.context.lottery = lottery;
});

test('test increase and then getEscrow', async t => {
	const lottery = t.context.lottery;
	const initE = lottery.getEscrow(lottery_issuer);
	const txn = lottery.increase({from: lottery_issuer, value: web3.toWei('10', 'ether')});
	const r =  await txnUtils.getReceiptPromise(web3, txn, 60);
	console.log(`txn: ${txn}, r: ${r}`);
	t.truthy(r, `The receipt of ${txn} should not be null.`);

	const gap =  await txnUtils.retryPromise(
		() => {
			let e2 = lottery.getEscrow(lottery_issuer);
			console.log(`e2: ${e2}`);
			return web3.fromWei(e2.minus(initE), "ether").toNumber() === 10;
		},
		15);
	t.true(gap, "the escrow is not actually increased.");
});