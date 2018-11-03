const test = require('ava');
const web3 = require('./web3Utils')
const txnUtils = require('./txnUtils.js');
const deployInfo = require('./deployInfo');
const testUtils = require('./testUtils');
const lg = require('./lottery_generator');

const log = testUtils.logBlue("Redeem of version 0.test");
const log2 = testUtils.logCyan("Redeem.succefull_redeem of version 0.test");
const transRunner = new txnUtils.TransactionRunner(web3);

const accounts = web3.eth.accounts
const adminAcc = accounts[0];
const lottery_issuer = accounts[1];
const file_receiver = accounts[1];
const file_sender = accounts[2];
//const lottery_winner = file_sender;
const rs1 = "[B$'4d~x3>1d{it4`{DXM~S]+Y#q-,";//"0x5b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c";
const rs2 = "lL=2@v!)tYw718T$do[|b)*m.9%[M.";
const lotteryData = lg.assembleLottery(rs1, rs2, 0, file_sender);//"0x001E" + web3.toHex(rs2).substring(2) + hashRs1.substring(2) + file_sender.substring(2) + nowString;
const sig = web3.eth.sign(lottery_issuer, web3.sha3(lotteryData, { encoding: "hex" }));
// log(`lotteryData:`, lotteryData);
// log(`signature:`, sig);


test.before("Deloy a new lottery contract", async t => {

    log(`starting test: ${t.title}`);
    const contracts = await deployInfo.deployLotteryContractPromise("Redeem lottery tests", web3, adminAcc);
    t.truthy(contracts.lottery);
    t.truthy(contracts.fileToken);
    const {lottery, fileToken} = contracts;

    const amount = 30000;
    let r = await transRunner.syncRun(lottery.increase, adminAcc, file_receiver, amount);
    log(`executed increase txn: ${r.txn}`);
    t.truthy(r.receipt, `The receipt of ${r.txn} should not be null.`);
    t.is(fileToken.balanceOf(file_receiver).toNumber(), amount);

    r = await transRunner.syncRun(lottery.increase, adminAcc, file_sender, amount);
    log(`executed increase txn: ${r.txn}`);
    t.is(fileToken.balanceOf(file_sender).toNumber(), amount);
    
    t.context.lottery = lottery;
    t.context.fileToken = fileToken;
});

test.serial("redeem without pledge test", async t => {
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;

    let redeem_txn = await transRunner.syncRun(lottery.redeemLottery, file_sender, lotteryData, sig, rs1);
    log(`executed redeemLottery txn: ${redeem_txn.txn}`);
    t.truthy(redeem_txn.receipt, `The receipt of ${redeem_txn.txn} should not be null.`);
    t.is(redeem_txn.receipt.logs.length, 0);

    let afterRedeem = fileToken.balanceOf(lottery_issuer);
    t.is(afterRedeem.toNumber(), 30000, 'The balance of the Lottery_issuer should not have been changed.');

    let winner_balance = fileToken.balanceOf(file_sender);
    t.is(winner_balance.toNumber(), 30000, "Winner did not get rewarded.");
});

test.serial("redeem with pledge test", async t => {
    const transRunner = new txnUtils.TransactionRunner(web3);
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;
    /** Prerequisitions befor a file sender can redeem a winning lottery:
     * 1. The file sender turn in enough pledge.
     * 2. The file receiver approves the Lottery contract account can tranfer his tokens to the file
     *      to other account
     */

    // 1 turn in pledge
    const turnInTxn = await transRunner.syncRun(fileToken.turnInPledge,  file_sender, 10000);
    log2(`executed turnInPledge txn: ${turnInTxn.txn}`);
    t.truthy(turnInTxn.receipt && turnInTxn.receipt.logs.length > 0);
    // confirm there is enough pledge
    const pledge = fileToken.getPledge(file_sender);
    t.is(pledge.toNumber(), 10000);
    t.is(fileToken.balanceOf(file_sender).toNumber(), 20000);

    // 2 approve token transfer
    const approvalAmount = 1000;
    const approveTxn = await transRunner.syncRun(fileToken.approve, file_receiver, lottery.address, approvalAmount);
    log2(`executed approve txn: ${approveTxn.txn}`);
    t.truthy(approveTxn.receipt.logs.length > 0, 'approveTxn failed or worked unexpectedly.');
    // confirm the approve worked
    t.is(fileToken.allowance(file_receiver, lottery.address).toNumber(), approvalAmount);

    // Finally, call the redeemLottery again.
    let redeem_txn = await transRunner.syncRun(lottery.redeemLottery, file_sender, lotteryData, sig, rs1);
    log2(`executed redeemLottery txn: ${redeem_txn.txn}`);
    t.truthy(redeem_txn.receipt.logs.length === 3, 'redeem_txn failed or worked unexpectedly.');

    let afterRedeem = fileToken.balanceOf(lottery_issuer);
    t.is(afterRedeem.toNumber(), 29000, 'The balance of the Lottery_issuer should be changed.');
    let winner_balance = fileToken.balanceOf(file_sender);
    t.is(winner_balance.toNumber(), 21000, "Winner did not get rewarded.");
});
