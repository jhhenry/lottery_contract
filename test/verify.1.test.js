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
    { name: names[0] },
    { name: names[1], c_args: ['0x' + 'f'.repeat(64), "FileToken", 0, "Ft"] }
];

const transRunner = new txnUtils.TransactionRunner(web3);

const rsList = [
    {
        rs1: "q9-6i(pNfr~b&PgB^J/l4A?^m6r8oI",
        rs2: "d1q|Y6:PdmWHY17DbO!g`'?wvu{M.s"
    },
    {
        rs1: "B=w31dFOf}6wZ(cftWWnqpG[?01Q-V",
        rs2: "gS`/da=55n4vWXQ;%)Qe1>TTeJ91YW"
    },
    {
        rs1: "=B<N/@Ok%;@dzYmAL%l-6pBJ)oJL{n",
        rs2: "giyGv#I[Q:m4&NBI&ja;rogqq~rW}]"
    }
];
const transfer_amount = 10000;
const faceValue = 500;
const pledgeAmount = 5000;
const approveAmount = 9000;


test.before(
    "deploy lottery and fileToken contract respectively",
    async t => {
        console.time("before run tests");
        log("Running before of Redeem.1.test");
        await testUtils.confirmContractsDeployed(contracts_names, deployInfo, web3, adminAcc, t, { testName: "Redeem(version 1) test" });

        const lottery = t.context.lottery;
        const fileToken = t.context[names[1]];
        // transfer 10000 tokens from admin  account to the file_sender who will turn in pledge and redeem a lottery
        // transfer 10000 tokens from admin  account to the file_receiver who issue lottery and approve the lottery contract can tranfer tokens to any account on it behalf
        const txns = await transRunner.syncBatchRun([
            { contractFunc: fileToken.transfer, from: adminAcc, funcArgs: [file_sender, transfer_amount] },
            { contractFunc: fileToken.transfer, from: adminAcc, funcArgs: [file_receiver, transfer_amount] }
        ]);
        const transferToSenderTxn = txns[0];
        const transferToReceiverTxn = txns[1];
        t.truthy(transferToSenderTxn.receipt && transferToSenderTxn.receipt.logs.length > 0);
        t.deepEqual(fileToken.balanceOf(file_sender), new BigNumber(transfer_amount));
        t.truthy(transferToReceiverTxn.receipt && transferToReceiverTxn.receipt.logs.length > 0);
        t.deepEqual(fileToken.balanceOf(file_receiver), new BigNumber(transfer_amount));

        const txns2 = await transRunner.syncBatchRun([
            { contractFunc: fileToken.approve, from: file_receiver, funcArgs: [lottery.address, approveAmount] },
            { contractFunc: fileToken.turnInPledge, from: file_sender, funcArgs: [pledgeAmount] }
        ]);

        const approveTxn = txns2[0];
        const pledgeTxn = txns2[1];
        t.truthy(approveTxn.receipt && approveTxn.receipt.logs.length > 0);
        t.is(fileToken.allowance(file_receiver, lottery.address).toNumber(), approveAmount);
        t.truthy(pledgeTxn.receipt && pledgeTxn.receipt.logs.length > 0);
        t.is(fileToken.getPledge(file_sender).toNumber(), pledgeAmount);
        t.is(fileToken.balanceOf(file_sender).toNumber(), transfer_amount - pledgeAmount);
        console.timeEnd("before run tests");
    }
);

test.serial("succeed", async t => {
    const { lottery, [names[1]]: fileToken} = t.context;
    rsList.forEach(item => {
        const {rs1, rs2} = item;
        const winningLottery = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue: faceValue, probability: 10 });
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        const r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs1), { from: file_sender });
        t.true(r[0], `VerifyLottery failed because of the error, "${r[1]}"`);
    });
});

test.serial("insufficient balance", async t => {
    const { lottery, [names[1]]: fileToken} = t.context;

    const txns = await transRunner.syncRun(fileToken.transfer, file_receiver, file_sender, transfer_amount - 100);
    t.truthy(txns.receipt && txns.receipt.logs.length > 0);
    t.deepEqual(fileToken.balanceOf(file_receiver), new BigNumber(100));

    rsList.forEach(item => {
        const {rs1, rs2} = item;
        const winningLottery = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue, probability: 10 });
        //log(`\nft.address: ${fileToken.address}\naddress   : ${addr}\nwinningLottery:${winningLottery}`);
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        const r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs1), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed due to insufficient balance. "${r[1]}"`);
        t.is(r[1], "Insufficient balance for the issuer");
    });
});

test.serial("insufficient allowance", async t => {
    const { lottery, [names[1]]: fileToken} = t.context;

    const approveTxn = await transRunner.syncRun(fileToken.approve,  file_receiver, lottery.address, 499);
    t.truthy(approveTxn.receipt && approveTxn.receipt.logs.length > 0);
    t.is(fileToken.allowance(file_receiver, lottery.address).toNumber(), 499);
    
    rsList.forEach(item => {
        const {rs1, rs2} = item;
        const winningLottery = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue, probability: 10 });
        //log(`\nft.address: ${fileToken.address}\naddress   : ${addr}\nwinningLottery:${winningLottery}`);
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        const r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs1), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed due to insufficient allowance. "${r[1]}"`);
        t.is(r[1], "Insufficient allowance for the issuer");
    });
});

test("wrong signature", async t => {
    const { lottery, [names[1]]: fileToken} = t.context;
    rsList.forEach(item => {
        const {rs1, rs2} = item;
        const winningLottery = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue: faceValue, probability: 10 });
        let sig = "0x" + '1'.repeat(130);//web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        let r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs1), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed because of the wrong signatures, "${r[1]}"`);
        t.is(r[1], "Signature verification failed");

        sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' })).substring(0, 130) + "aa";
        r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs1), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed because of the wrong signatures, "${r[1]}"`);
        t.is(r[1], "Signature verification failed");
    });
});

test("wrong rs1 hash", async t => {
    const { lottery, [names[1]]: fileToken} = t.context;
    rsList.forEach(item => {
        const {rs1, rs2} = item;
        const winningLottery = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue: faceValue, probability: 10 });
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        const r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs2), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed due to mismatch between hash of rs1 and winningData, "${r[1]}"`);
        t.is(r[1], "Hash of the random string 1 does not match.");
    });
});

test("not a winning lottery", async t => {
    const { lottery, [names[1]]: fileToken} = t.context;
    rsList.forEach(item => {
        const {rs1, rs2} = item;
        const winningLottery = lg.assembleLottery(rs2, rs1, 1, file_sender, { token_addr: fileToken.address, faceValue: faceValue, probability: 10 });
        //log(`\nwinningLottery:${winningLottery}`);
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        const r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs2), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed due to rs1, rs2 not constituting a winning lottery "${r[1]}"`);
        t.is(r[1], "It is not a winning lottery");
    });
});

test("insufficient escrow", async t => {
    const { lottery, } = t.context;
    rsList.forEach(item => {
        const {rs1, rs2} = item;
        const addr = "0x" + "0".repeat(40);
        const winningLottery = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: addr, faceValue: faceValue, probability: 10 });
        //log(`\nft.address: ${fileToken.address}\naddress   : ${addr}\nwinningLottery:${winningLottery}`);
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        const r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs1), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed due to insufficient escrow."${r[1]}"`);
        t.is(r[1], "The escrow of the lottery issuer is less than the face value.");
    });
});


test("insufficient pledge in the lottery contract", async t => {
    const { lottery, [names[1]]: fileToken} = t.context;
    rsList.forEach(item => {
        const {rs1, rs2} = item;
        /* case of using the lottery contract's built-in 10 multipling check pledge */
        const winningLottery = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue: 501, probability: 10 });
        //log(`\nft.address: ${fileToken.address}\naddress   : ${addr}\nwinningLottery:${winningLottery}`);
        const sig = web3.eth.sign(lottery_issuer, web3.sha3(winningLottery, { encoding: 'hex' }));
        const r = lottery.verifyLottery(winningLottery, sig, web3.toHex(rs1), { from: file_sender });
        t.false(r[0], `VerifyLottery should have failed due to insufficient pledge. "${r[1]}"`);
        t.is(r[1], "The msg.sender calling redeem does not have enough pledge.");

        /** case of less than pledge using the checkPledge of the file token*/
        const lottery_with_checkPledgeAware_token = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue: 501, probability: 10, token_type: 1 });
        const sig2 = web3.eth.sign(lottery_issuer, web3.sha3(lottery_with_checkPledgeAware_token, { encoding: 'hex' }));
        const r2 = lottery.verifyLottery(lottery_with_checkPledgeAware_token, sig2, web3.toHex(rs1), { from: file_sender });
        t.false(r2[0], `VerifyLottery should have failed due to insufficient pledge. "${r[1]}"`);
        t.is(r2[1], "The msg.sender calling redeem does not have enough pledge.");

        /* case of enough pledge in the file token */
        const lottery_with_checkPledgeAware_token2 = lg.assembleLottery(rs1, rs2, 1, file_sender, { token_addr: fileToken.address, faceValue: 10, probability: 10, token_type: 1 });
        const sig3 = web3.eth.sign(lottery_issuer, web3.sha3(lottery_with_checkPledgeAware_token2, { encoding: 'hex' }));
        const r3 = lottery.verifyLottery(lottery_with_checkPledgeAware_token2, sig3, web3.toHex(rs1), { from: file_sender });
        t.true(r3[0], `VerifyLottery should have succeeded.`);

    });
});
