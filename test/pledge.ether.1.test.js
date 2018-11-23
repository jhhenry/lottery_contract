const test = require('ava');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
const txnUtils = require('./txnUtils.js');
const testUtils = require('./testUtils');
const log = testUtils.logBlue("Pledge ether(version 1).test");

const accounts = web3.eth.accounts
const adminAcc = accounts[0];
const file_sender = accounts[2];

// const _initialAmount = new BigNumber('f'.repeat(64), 16);
const names = ['lottery']
const contracts_names = [
    {name: names[0]}, 
];

const transRunner = new txnUtils.TransactionRunner(web3);
const faceValue = 500;


test.before("deploy lottery", async t => {
        log("Start Running");
        await testUtils.confirmContractsDeployed(contracts_names, deployInfo, web3, adminAcc, t, {testName: "Pledge ether(version 1) test"});
    }
);

test.serial("turn in pledge ", async t => {
    const lottery = t.context.lottery;
    await transRunner.setValue(10 * faceValue).syncRun(lottery.turnInPledge, file_sender);
    let p = lottery.getPledge({from: file_sender});
    t.is(p.toNumber(), 10 * faceValue);
});

test.serial("turn in more ", async t => {
    const lottery = t.context.lottery;
    await transRunner.setValue(100 * faceValue).syncRun(lottery.turnInPledge, file_sender);
    let p = lottery.getPledge({from: file_sender});
    t.is(p.toNumber(), 110 * faceValue);
});

test.serial("withdraw all pledge ", async t => {
    const lottery = t.context.lottery;
    await transRunner.syncRun(lottery.withdrawPledge, file_sender);
    let p = lottery.getPledge({from: file_sender});
    t.is(p.toNumber(), 0);
});