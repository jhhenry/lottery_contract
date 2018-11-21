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
const names = ['lottery', 'simplefiletoken']
const contracts_names = [
    {name: names[0]}, 
    {name: names[1], c_args:['0x' + 'f'.repeat(64), "FileToken", 0, "Ft"]}
];

const transRunner = new txnUtils.TransactionRunner(web3);
const rs1 = "=B<N/@Ok%;@dzYmAL%l-6pBJ)oJL{n";
const rs2 = "giyGv#I[Q:m4&NBI&ja;rogqq~rW}]";
const transfer_amount = 10000;
const faceValue = 500;
const pledgeAmount = 5000;
let lotteryData;
let sig;

test.before(
    "deploy lottery and fileToken contract respectively", 
    async t => {
        console.time("before run tests");
        log("Running before of Redeem.1.test");
        await testUtils.confirmContractsDeployed(contracts_names, deployInfo, web3, adminAcc, t, {testName: "Redeem(version 1) test"});

        const lottery = t.context.lottery;
        const fileToken = t.context[names[1]];
        // transfer 10000 tokens from admin  account to the file_sender who will turn in pledge and redeem a lottery
        // transfer 10000 tokens from admin  account to the file_receiver who issue lottery and approve the lottery contract can tranfer tokens to any account on it behalf
        const txns = await transRunner.syncBatchRun([
            {contractFunc:fileToken.transfer, from: adminAcc, funcArgs: [file_sender, transfer_amount]},
            {contractFunc:fileToken.transfer, from: adminAcc, funcArgs: [file_receiver, transfer_amount]}
        ]);
        const transferToSenderTxn = txns[0];
        const transferToReceiverTxn = txns[1];
        t.truthy(transferToSenderTxn.receipt && transferToSenderTxn.receipt.logs.length > 0);
        t.deepEqual(fileToken.balanceOf(file_sender), new BigNumber(transfer_amount));
        t.truthy(transferToReceiverTxn.receipt && transferToReceiverTxn.receipt.logs.length > 0);
        t.deepEqual(fileToken.balanceOf(file_receiver), new BigNumber(transfer_amount));

        const txns2 = await transRunner.syncBatchRun([
            {contractFunc: fileToken.approve, from: file_receiver, funcArgs: [lottery.address, 9000]},
            {contractFunc: fileToken.turnInPledge, from: file_sender, funcArgs: [pledgeAmount]}
        ]);

        const approveTxn = txns2[0];
        const pledgeTxn = txns2[1];
        t.truthy(approveTxn.receipt && approveTxn.receipt.logs.length > 0);
        t.is(fileToken.allowance(file_receiver, lottery.address).toNumber(), 9000);
        t.truthy(pledgeTxn.receipt && pledgeTxn.receipt.logs.length > 0);
        t.is(fileToken.getPledge(file_sender).toNumber(), pledgeAmount);
        t.is(fileToken.balanceOf(file_sender).toNumber(), transfer_amount - pledgeAmount);
        console.timeEnd("before run tests");

        lotteryData = lg.assembleLottery(rs1, rs2, 1, file_sender, {token_addr: fileToken.address, faceValue: faceValue, probability: 10});
        sig = web3.eth.sign(lottery_issuer, web3.sha3(lotteryData, {encoding: 'hex'}));
    }
);

test("redeem successfully", async t => {
    const {lottery, [names[1]]: fileToken} = t.context;
    t.is(fileToken.balanceOf(lottery_issuer).toNumber(), transfer_amount);
    t.is(fileToken.getPledge(file_sender).toNumber(), pledgeAmount);
   
    log(`Executing redeemLottery with {lotteryData: ${lotteryData}, sig: ${sig}, rs1: ${rs1}}`)
    const redeemTxn = await transRunner.syncRun(lottery.redeemLottery, file_sender, lotteryData, sig, web3.toHex(rs1));
    const finalBalance = transfer_amount - pledgeAmount + faceValue;
    t.truthy(redeemTxn.receipt && redeemTxn.receipt.logs.length === 3);
    t.is(fileToken.balanceOf(file_sender).toNumber(), transfer_amount - pledgeAmount + faceValue);

    const redeemTxn2 = await transRunner.syncRun(lottery.redeemLottery, file_sender, lotteryData, sig, web3.toHex(rs1));
    t.truthy(redeemTxn2.receipt && redeemTxn2.receipt.logs.length === 0);
    t.is(fileToken.balanceOf(file_sender).toNumber(), finalBalance);
});
