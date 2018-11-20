const test = require('ava');
const BigNumber = require('bignumber.js');
const web3 = require('./web3Utils');
const deployInfo = require('./deployInfo');
const txnUtils = require('./txnUtils.js');
const testUtils = require('./testUtils');
const lg = require('./lottery_generator');

const log = testUtils.logBlue("Redeem(version 1).test");

const accounts = web3.eth.accounts
const adminAcc = accounts[0];
const lottery_issuer = accounts[1];
log(`lottery_issuer: ${lottery_issuer}`);
const file_receiver = accounts[1];
const file_sender = accounts[2];

// const _initialAmount = new BigNumber('f'.repeat(64), 16);
const names = ['lottery']
const contracts_names = [
    {name: names[0]}, 
];

const transRunner = new txnUtils.TransactionRunner(web3);
const rs1 = "=B<N/@Ok%;@dzYmAL%l-6pBJ)oJL{n";
const rs2 = "giyGv#I[Q:m4&NBI&ja;rogqq~rW}]";

const transferEther = web3.toWei(3, 'finney');
const faceValue = 500;
let lotteryOfEther;

let sig2;

test.before(
    "deploy lottery and fileToken contract respectively", 
    async t => {
        await testUtils.confirmContractsDeployed(contracts_names, deployInfo, web3, adminAcc, t, {testName: "Redeem(version 1) test"});

        const lottery = t.context.lottery;

        //prepare for testing redeeming ether
        const initE = lottery.getEscrow(file_receiver);
        const r = await transRunner.setValue(transferEther).syncRun(lottery.increase, file_receiver);
        t.truthy(r.receipt, `The receipt of ${r.txn} should not be null.`);
        let e2 = lottery.getEscrow(file_receiver);
        t.is(e2.minus(initE).toString(), transferEther, "the balance should have been increased ");

        let token_addr = "0x" + '0'.repeat(40);
       
        lotteryOfEther = lg.assembleLottery(rs1, rs2, 1, file_sender, {token_addr, faceValue, probability: 10});
        sig2 = web3.eth.sign(lottery_issuer, web3.sha3(lotteryOfEther, {encoding: 'hex'}));
        log(`lotteryOfEther: ${lotteryOfEther}`);
        log(`sig2: ${sig2}`);
    }
);

test.serial("redeem ether successfully", async t => {
   
    const lottery = t.context.lottery;
    const redeemTxn = await transRunner.syncRun(lottery.redeemLottery, file_sender, lotteryOfEther, sig2, web3.toHex(rs1));
    t.truthy(redeemTxn.receipt && redeemTxn.receipt.logs.length === 2);
    t.is(lottery.getEscrow(file_receiver).toString(), "2999999999999500");
});

test.serial("failed to redeem ether due to replay attack ", async t => {
   
    const lottery = t.context.lottery;
    const redeemTxn = await transRunner.syncRun(lottery.redeemLottery, file_sender, lotteryOfEther, sig2, web3.toHex(rs1));
    t.truthy(redeemTxn.receipt && redeemTxn.receipt.logs.length === 0);
    t.is(lottery.getEscrow(file_receiver).toString(), "2999999999999500");
});