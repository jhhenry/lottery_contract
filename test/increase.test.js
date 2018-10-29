const test = require('ava');
const txnUtils = require('./txnUtils');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
const testUtils = require('./testUtils');

const log = testUtils.logBlue("Increase.test");
const transRunner = new txnUtils.TransactionRunner(web3);

const accounts = web3.eth.accounts
const adminAddr = accounts[0];
const file_receiver = accounts[1];

// const lottery_issuer = file_receiver;
// const file_sender = accounts[2];


test.before("initialize a existing lottery contract", async t => {
    const contracts = await deployInfo.deployLotteryContractPromise("Increase tokens tests", web3, adminAddr);
    t.truthy(contracts.lottery);
    t.truthy(contracts.fileToken);
    t.context.lottery = contracts.lottery;
    t.context.fileToken = contracts.fileToken;
});

test.serial('test increase with non-admin account', async t => {
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;
    
    const initE = fileToken.balanceOf.call(file_receiver);
    t.is(initE.toNumber(), 0, `The initial balance of the file_receiver should be 0.`)

    const transferAmount = 30000;
    try {
        const r = await transRunner.syncRun(lottery.increase, file_receiver, file_receiver, transferAmount);
        log(`executed increase txn: ${r.txn}`);
        t.truthy(r.receipt, `The receipt of ${r.txn} should not be null.`);
    } catch(err) {
        log('Got execption when calling increase transaction..');
    }
    
	let e2 = fileToken.balanceOf(file_receiver);
	log(`the balance after increase by non-admin: ${e2}`);
	t.is(e2.minus(initE).toNumber(), 0, "the balance should not have been increased due to non-admin account.");
});

test.serial('test increase and then getBalance', async t => {
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;

    const initE = fileToken.balanceOf.call(file_receiver);
    t.is(initE.toNumber(), 0, `The initial balance of the file_receiver should be 0.`)

    const transferAmount = 30000;
    const r = await transRunner.syncRun(lottery.increase, adminAddr, file_receiver, transferAmount);
    log(`executed increase txn: ${r.txn}`);
	t.truthy(r.receipt, `The receipt of ${r.txn} should not be null.`);
    let e2 = fileToken.balanceOf(file_receiver);
    log(`the balance after increase by admin: ${e2}`);
    t.is(e2.minus(initE).toNumber(), transferAmount, "the balance should have been increased ")
});
