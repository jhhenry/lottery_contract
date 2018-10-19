const test = require('ava');
const txnUtils = require('./txnUtils');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
const testUtils = require('./testUtils');

const log = testUtils.logBlue("Increase.test");
const transRunner = new txnUtils.TransactionRunner(web3, log);

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

test.serial('test increase with non-admin account', async t => {
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;
    const transferAmount = 30000;
    //log("fileToken", fileToken);
    const initE = fileToken.balanceOf.call(file_receiver);
    log("initE", initE);
    t.is(initE.toNumber(), transferAmount, `The initial balance of the file_receiver should be 0.`)
    const r = await transRunner.syncRun(lottery.increase, file_receiver, file_receiver, transferAmount);
    t.truthy(r.receipt, `The receipt of ${r.txn} should not be null.`);
	let e2 = fileToken.balanceOf(file_receiver);
	console.log(`the balance after increase by non-admin: ${e2}`);
	t.is(e2.minus(initE).toNumber(), 0, "the balance should not have been increased due to non-admin account.");
});

test.serial('test increase and then getBalance', async t => {
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;
    const transferAmount = 30000;
    //log("fileToken", fileToken);
    const initE = fileToken.balanceOf.call(file_receiver);
    log("initE", initE);
    t.is(initE.toNumber(), transferAmount, `The initial balance of the file_receiver should be 0.`)
	const r = await transRunner.syncRun(lottery.increase, adminAddr, file_receiver, transferAmount);// lottery.increase(file_receiver, transferAmount, {from: adminAddr});
	t.truthy(r.receipt, `The receipt of ${r.txn} should not be null.`);
    let e2 = fileToken.balanceOf(file_receiver);
    console.log(`the balance after increase by admin: ${e2}`);
    t.is(e2.minus(initE).toNumber(), transferAmount, "the balance should have been increased ")
});
