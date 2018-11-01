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
const contracts_names = [
    {name:'lottery'}, 
    {name: 'simplefiletoken', c_args:['0x' + 'f'.repeat(64), "FileToken", 0, "Ft"]}
];


test.before(
    "deploy lottery and fileToken contract respectively", 
    async t => {
        const contracts = await deployInfo.deploy(web3, adminAcc, contracts_names, {testName: "Deploy contracts test"});

        t.is(contracts.length, 2);
        const lottery = contracts[0][contracts_names[0].name];
        const ft = contracts[1][contracts_names[1].name];
        t.truthy(lottery);
        t.truthy(ft);

        t.context.lottery = lottery;
        t.context.ft = ft;
    }
);

test("test deployed lottery contract", async t => {
    const lottery = t.context.lottery;
    t.is(typeof lottery.splitLottery1, 'function');
})

test("test deployed fileToken contract", async t => {
    const ft = t.context.ft;
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