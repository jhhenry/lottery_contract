const test = require('ava');
const web3 = require('./web3Utils')
const txnUtils = require('./txnUtils.js');
const deployInfo = require('./deployInfo');
const testUtils = require('./testUtils');

const log = testUtils.logBlue;
const log2 = testUtils.logCyan

const accounts = web3.eth.accounts
const lottery_issuer = accounts[1];
const file_receiver = accounts[1];
const file_sender = accounts[2];
//const lottery_winner = file_sender;
const rs1 = "0x5b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c";
const hashRs1 = web3.sha3(rs1, {encoding:"hex"});
const rs2 = "lL=2@v!)tYw718T$do[|b)*m.9%[M.";
var nowString= "00000" + web3.toHex(Date.now()).substring(2)
const lotteryData = "0x001E"+ web3.toHex(rs2).substring(2) + hashRs1.substring(2) + file_sender.substring(2) + nowString;
//"0x001E6c4c3d32407621297459773731385424646f5b7c62292a6d2e39255b4d2e21e765a9a9dfebcbe94d520a2bb225cfc9c8345f330a9dd1e987b8b14d0638307c8c7a481a3dac2431745ce9b18b3bb8b6c526e7000001659a693424";
const sig = web3.eth.sign(lottery_issuer, web3.sha3(lotteryData, {encoding:"hex"}));
//"0x393f2778c4f908edbb6c456960fecc877d57c5e3b5c85e06601e30cb601481c6517400aef340363cefee5f38f6fdfc082ff1b0945ca7465ae0a2e814b97173211c";
log(`lotteryData:`, lotteryData);
log(`signature:`, sig);


test.before("initialize a existing lottery contract", async t => {
    const contracts = deployInfo.getContracts(web3, t);
    t.truthy(contracts.lottery);
    t.truthy(contracts.fileToken);
    t.context.lottery = contracts.lottery;
    t.context.fileToken = contracts.fileToken;
});

test("redeem without pledge test", async t => {
    const lottery = t.context.lottery;
    const fileToken = t.context.fileToken;


	let verify_txn = lottery.redeemLottery(lotteryData, sig, rs1, { from: file_sender, gas: 300000 });
	log(`verify_txn:`,` ${verify_txn}`);
	let r = await txnUtils.getReceiptPromise(web3, verify_txn, 60);
    log(`Has got the receipt of verify_txn:`, ` ${verify_txn}`);
    log(`The logs of ${verify_txn}:`, ` ${r.logs ? r.logs.length :  0}`);
	await txnUtils.retryPromise(
		() => {
			let afterVerify = fileToken.balanceOf(lottery_issuer);
			log(`afterVerify: `,`${afterVerify}`);
			return afterVerify.toNumber() == 30000;
		},
		15);
	let winner_balance = fileToken.balanceOf(file_sender);
    t.is(winner_balance.toNumber(), 30000, "Winner did not get rewarded.");
    
     /** Prerequisitions befor a file sender can redeem a winning lottery:
     * 1. The file sender turn in enough pledge.
     * 2. The file receiver approves the Lottery contract account can tranfer his tokens to the file
     *      to other account
     */

     // 1 turn in pledge
    const turnInTxn = fileToken.turnInPledge(10000, {from: file_sender});
    await txnUtils.getReceiptPromise(web3, turnInTxn, 60);
    // confirm there is enough pledge
    const pledge = fileToken.getPledge(file_sender);
    t.is(pledge.toNumber(), 10000);
    t.is(fileToken.balanceOf(file_sender).toNumber(), 20000);

    // 2 approve token transfer
    const approvalAmount = 1000;
    const approveTxn = fileToken.approve(lottery.address, approvalAmount, {from: file_receiver});
    await txnUtils.getReceiptPromise(web3, approveTxn, 60);
    // confirm the approve worked
    t.is(fileToken.allowance(file_receiver, lottery.address).toNumber(), approvalAmount);

    verify_txn = lottery.redeemLottery(lotteryData, sig, rs1, { from: file_sender, gas: 3000000 });
	log2(`verify_txn:`,` ${verify_txn}`);
	r = await txnUtils.getReceiptPromise(web3, verify_txn, 60);
    log2(`Has got the receipt of verify_txn:`, ` ${verify_txn}`);
    log2(`The receipt of ${verify_txn}:`, ` ${r.logs ? r.logs.length :  0}`);
	await txnUtils.retryPromise(
		() => {
			let afterVerify = fileToken.balanceOf(lottery_issuer);
			log2(`afterVerify: `,`${afterVerify}`);
			return afterVerify.toNumber() == 29000;
		},
		20);
	winner_balance = fileToken.balanceOf(file_sender);
	t.is(winner_balance.toNumber(), 21000, "Winner did not get rewarded.");
})