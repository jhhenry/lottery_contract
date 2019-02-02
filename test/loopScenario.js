const web3 = require('./web3Utils');
const txnUtils = require('./txnUtils.js');
const testUtils = require('./testUtils');
const deployInfo = require('./deployInfo');
const cryptoRandomString = require('crypto-random-string');
const keccak256 = require('keccak256');
const lg = require('./lottery_generator');

const log = testUtils.logBlue("loopScenario.js"); 

/** 1. connect to a ether node
 *  2. instantiate a contract
 *  3. construct a contract instance.
 *  4. generate random string pairs
 *  5. check if each string pairs match winning condition.
 *  6. call the redeemLottery function with the winning pairs
 *  7. loop: use the old winning lottery to call the redeemLottery again
 */

const accounts = web3.eth.accounts;
const adminAcc = accounts[0];
const lottery_issuer = accounts[1];
log(`lottery_issuer: ${lottery_issuer}`);
const file_receiver = accounts[1];
const file_sender = accounts[2];

const transfer_amount = 10000;
const faceValue = 50;
const pledgeAmount = 5000;
const approveAmount = 9000;

// const _initialAmount = new BigNumber('f'.repeat(64), 16);
const names = ['lottery', 'simplefiletoken']
const contracts_names = [
    { name: names[0] },
    { name: names[1], c_args: ['0x' + 'f'.repeat(64), "FileToken", 0, "Ft"] }
];

const transRunner = new txnUtils.TransactionRunner(web3);

deploy(web3, adminAcc, contracts_names).then(r => {
    const contracts = r;
    Object.keys(contracts[0]).forEach(k => log(`${k} : ${contracts[0][k]}`))
    log(`contracts deployed: ${contracts[0]}\n ${contracts[1].simplefiletoken}`);
    const lottery = contracts[0].lottery;
    const fileToken = contracts[1][names[1]];
    beforeRedeem(transRunner, lottery, fileToken).then(async r=> {
        // log(`lottery.redeemLottery: ${lottery.redeemLottery}`);
        // Object.keys(lottery).forEach(k => log(`lottery.${k}: ${lottery[k]}`));
        const targetN = 11;
        const rsPairs = look4WinningStrings(lottery, targetN);
        //assemble & redeem lottery
        await redeem(rsPairs, lottery, fileToken);
        for (let i = 0; i < 3; i++) {
            redeem(rsPairs, lottery, fileToken);
        }
    })
});

async function redeem(rsPairs, lottery, fileToken) {
    let lastB = transfer_amount - pledgeAmount;
    for (let i = 0; i < rsPairs.length; i++) {
        const item = rsPairs[i];
        const rs1 = item.rs1;
        const rs2 = item.rs2;
        const ld = lg.assembleLottery(rs1, rs2, 1, file_sender, {token_addr: fileToken.address, faceValue: faceValue, probability: 3});
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(ld, {encoding: 'hex'}));
        const rs1_hex = web3.toHex(rs1);
        log(`lotteryData:${ld}, sig: ${sig}, rs1_hex: ${rs1_hex}`);
        try {
            // const vr = lottery.verifyLottery(ld, sig, rs1_hex, { from: file_sender });
            // log(`verify result: ${vr}`);
            const redeemTxn = await transRunner.syncRun(lottery.redeemLottery, file_sender, ld, sig, rs1_hex);
            log(`redeemTxn: ${redeemTxn.txn}`);
            log('redeemTxn.logs.length', redeemTxn.receipt.logs.length);
            const b = fileToken.balanceOf(file_sender).toNumber();
            log(`current balance: ${b}`);
            lastB = b;
        } catch(e) {
            log(`caught an error: ${e}`);
        }
    }
}

async function beforeRedeem(transRunner, lottery, fileToken)
{
    //turn in enough escrow and pledge
    const txns = await transRunner.syncBatchRun([
        { contractFunc: fileToken.transfer, from: adminAcc, funcArgs: [file_sender, transfer_amount] },
        { contractFunc: fileToken.transfer, from: adminAcc, funcArgs: [file_receiver, transfer_amount] }
    ]);
    log(`logs of tranfer token from admin to file_send: ${txns[0].receipt.logs.length}`);
    log(`logs of tranfer token from admin to file_receiver: ${txns[1].receipt.logs.length}`);
    const txns2 = await transRunner.syncBatchRun([
        { contractFunc: fileToken.approve, from: file_receiver, funcArgs: [lottery.address, approveAmount] },
        { contractFunc: fileToken.turnInPledge, from: file_sender, funcArgs: [pledgeAmount] }
    ]);
    log(`logs of approve from file_receiver: ${txns2[0].receipt.logs.length}`);
    log(`logs of file_sender's turning in pledge: ${txns2[1].receipt.logs.length}`);
}

async function deploy(web3, creatorAccount, contractsNames)
{
    const contracts = await deployInfo.deploy(web3, creatorAccount, contractsNames, {testName: "loopScenario"});
    return contracts;
}

function look4WinningStrings(lottery, targetNumber=11)
{
    let foundNum = 0;
    let tryNum = 0;
    const pairs = [];
    //for(let i = 0; i < 10;i++) 
    while(foundNum < targetNumber)
    {
        let rs1 = cryptoRandomString(20);//"=B<N/@Ok%;@dzYmAL%l-6pBJ)oJL{n";
        let rs2 = cryptoRandomString(20);//"giyGv#I[Q:m4&NBI&ja;rogqq~rW}]";
        let rs1rs2 = rs1 + rs2;
        
        const hash12 = keccak256(rs1rs2).toString('hex');
        let r = lottery.verifyWinningLottery("0x"+ hash12, web3.toHex(rs2), 3);
     
        if (r === true) {
            log(`rs1: ${rs1}; rs2: ${rs2};`);
            pairs.push({rs1, rs2});
            foundNum++;
        }
        tryNum++;
        //log(`${lottery.getHash(web3.toHex(rs1))}`);
    }
    log(`tryNum: ${tryNum}; foundNum: ${foundNum}`);
    return pairs;
}