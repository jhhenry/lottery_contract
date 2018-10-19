const test = require('ava');
const txnUtils = require('./txnUtils');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
const testUtils = require('./testUtils');

const log = testUtils.logBlue;

const accounts = web3.eth.accounts
const adminAddr = accounts[0];
const file_receiver = accounts[1];
// const lottery_issuer = file_receiver;
// const file_sender = accounts[2];


test.before("initialize a existing lottery contract", t => {
    let contracts = deployInfo.getContracts(web3, t);
    t.truthy(contracts.lottery);
    t.truthy(contracts.fileToken);
    t.context.lottery = contracts.lottery;
    t.context.fileToken = contracts.fileToken;
});


test('test increase and then getBalance', async t => {
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;
    const transferAmount = 30000;
    //log("fileToken", fileToken);
    const initE = fileToken.balanceOf.call(file_receiver);
    log("initE", initE);
    t.is(initE.toNumber(), 0, `The initial balance of the file_receiver should be 0.`)
	const txn = lottery.increase(file_receiver, transferAmount, {from: adminAddr});
	const r =  await txnUtils.getReceiptPromise(web3, txn, 60);
	log(`increase txn: ${txn}, receipt: ${r}`);
	t.truthy(r, `The receipt of ${txn} should not be null.`);

	const gap =  await txnUtils.retryPromise(
		() => {
			let e2 = fileToken.balanceOf(file_receiver);
			console.log(`e2: ${e2}`);
			return e2.minus(initE).toNumber() === transferAmount;
		},
		15);
	t.true(gap, "the escrow is not actually increased.");
});