const test = require('ava');
const BigNumber = require('bignumber.js');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
const testUtils = require('./testUtils');

const log = testUtils.logBlue("Deploy.test");

const accounts = web3.eth.accounts
const adminAcc = accounts[0];

log("admin account:", adminAcc);

const _initialAmount = new BigNumber('f'.repeat(64), 16);
const names = ['lottery', 'simplefiletoken']
const contracts_names = [
    {name: names[0]}, 
    {name: names[1], c_args:['0x' + 'f'.repeat(64), "FileToken", 0, "Ft"]}
];


test.before(
    "deploy lottery and fileToken contract respectively", 
    async t => {
        await testUtils.confirmContractsDeployed(contracts_names, deployInfo, web3, adminAcc, t, {testName: "Deploy contracts test"});
    }
);

test("test deployed lottery contract", async t => {
    const lottery = t.context.lottery;
    t.is(typeof lottery.splitLottery1, 'function');
})

test("test deployed fileToken contract", async t => {
    const ft = t.context[names[1]];
    t.truthy(ft.approve);
    t.is(typeof ft.adminAddr, 'function');
    t.is(ft.adminAddr.call(), adminAcc);
    t.is(ft.decimals.call().toNumber(), 0);
    t.is(ft.name.call(), 'FileToken');
    t.is(ft.symbol.call(), 'Ft');
    const ts = ft.totalSupply.call();
    log(` ${_initialAmount}`);
    t.deepEqual(ts, _initialAmount);
    
})