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
        
        const transferToSenderTxn = await transRunner.syncRun(fileToken.transfer, adminAcc, file_sender, transfer_amount);
        const transferToReceiverTxn = await transRunner.syncRun(fileToken.transfer, adminAcc, file_receiver, transfer_amount);
        t.truthy(transferToSenderTxn.receipt && transferToSenderTxn.receipt.logs.length > 0);
        t.deepEqual(fileToken.balanceOf(file_sender), new BigNumber(transfer_amount));
        
        // transfer 10000 tokens from admin  account to the file_receiver who issue lottery and approve the lottery contract can tranfer tokens to any account on it behalf
       
        t.truthy(transferToReceiverTxn.receipt && transferToReceiverTxn.receipt.logs.length > 0);
        t.deepEqual(fileToken.balanceOf(file_receiver), new BigNumber(transfer_amount));

        const approveTxn = await transRunner.syncRun(fileToken.approve, file_receiver, lottery.address, 9000);
        const pledgeTxn = await transRunner.syncRun(fileToken.turnInPledge, file_sender, pledgeAmount);
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

test("verify test", async t => {
    const {lottery, } = t.context;
    const r = lottery.verifyLottery(lotteryData, sig, web3.toHex(rs1), {from: file_sender});
    t.true(r[0], `VerifyLottery failed because of the error, "${r[1]}"`);
});

test("verify failed due to insufficient pledge", async t=> {
    const {lottery, [names[1]]: fileToken} = t.context;
    const lotteryData2 = lg.assembleLottery(rs1, rs2, 1, file_sender, {token_addr: fileToken.address, faceValue: 501, probability: 10});
    const r = lottery.verifyLottery(lotteryData2, sig, web3.toHex(rs1), {from: file_sender});
    t.true(r[1].indexOf("pledge") >=0);
    t.false(r[0], `VerifyLottery should have failed  due to insufficient pledge, "${r[1]}"`);
});


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
})