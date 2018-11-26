const test = require('ava');
const txnUtils = require('./txnUtils');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
const testUtils = require('./testUtils');

const log = testUtils.logBlue("Increase(version 1).test");
const transRunner = new txnUtils.TransactionRunner(web3);

const accounts = web3.eth.accounts
const file_receiver = accounts[1];
const adminAcc = accounts[0];

const names = ['lottery']
const contracts_names = [
    {name: names[0]}, 
];


test.before("initialize a existing lottery contract", async t => {
    await testUtils.confirmContractsDeployed(contracts_names, deployInfo, web3, adminAcc, t, {testName: "Increase(version 1) test"});
});

test.serial('test increase escrow (in ether)', async t => {
    const lottery = t.context.lottery;

    const initE = lottery.getEscrow(file_receiver);
    t.is(initE.toNumber(), 0, `The initial balance of the file_receiver should be 0.`)

    const transferAmount = web3.toWei(3, 'finney');
    const r = await transRunner.setValue(transferAmount).syncRun(lottery.increase, file_receiver);
	t.truthy(r.receipt, `The receipt of ${r.txn} should not be null.`);
    let e2 = lottery.getEscrow(file_receiver);
    t.is(e2.minus(initE).toString(), transferAmount, "the escrow should have been increased.");
});

test.serial("test withdraw all escrow", async t => {
    const lottery = t.context.lottery;
    await transRunner.syncRun(lottery.withdrawEscrow, file_receiver);
    let e2 = lottery.getEscrow(file_receiver);
    t.is(e2.toNumber(), 0, "the escrow should have been 0.");
});
