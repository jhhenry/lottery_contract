const fs = require('fs')
const web3 = require('./web3Utils');
const txnUtils = require('./txnUtils');
const testUtils = require('./testUtils');
const deployInfo = require('./deployInfo');
const compile = require('./compile');

const log = testUtils.logBlue;

const deployedFolder = deployInfo.deployedFolder;
const fn = deployInfo.fn;

const accounts = web3.eth.accounts;
const adminAddr = accounts[0];
const file_receiver = accounts[1];
const file_sender = accounts[2];

let lottery;
let fileToken;

/* create the 'deployed' folder */
if (!fs.existsSync(deployedFolder)) {
    fs.mkdirSync(deployedFolder);
}

if (fs.existsSync(fn)) {
    fs.unlinkSync(fn);
}

/* compile the latest Lottery contract. */
let compiled = compile.compileLotteryContract();
let lotteryAbi = compiled.lottery.abi;
let lotteryBytecode = compiled.lottery.bytecode;
let fileTokenAbi = compiled.fileToken.abi;

deloyLotteryContract();

/**
 * 1. Unlock all accounts.
 * 2. 
 */
function deloyLotteryContract() {
    log('Start deploying the lottery contract...');

    for (let acc of accounts) {
        web3.personal.unlockAccount(acc, 'highsharp', 36000);
    }
    log("Initialing a new contract...");

    lotteryContract = web3.eth.contract(lotteryAbi);
    lottery = lotteryContract.new(
        {
            from: adminAddr,
            data: lotteryBytecode,
            gas: '4700000'
        }, function (e, contract) {
            //log(e, contract);
            if (e) throw e;
            log("Creating the contract callback.");
            if (typeof contract.address !== 'undefined') {
                log('Contract mined! address: ', contract.address + ' transactionHash: ' + contract.transactionHash);
                let fileTokenAddr = lottery.fileToken.call();
                log(`fileTokenAddr:`, fileTokenAddr);
                fs.appendFile(fn, JSON.stringify({ lottery: { abi: lotteryAbi, addr: contract.address }, fileToken: { abi: fileTokenAbi, addr: fileTokenAddr } }), err => {
                    if (err) throw err;
                    log("Written addr to the delpoyed file.")
                });

                let fileTokenContract = web3.eth.contract(fileTokenAbi);
                fileToken = fileTokenContract.at(fileTokenAddr);
                transferTokenFromLotteryTo(lottery, adminAddr, file_receiver);
                transferTokenFromLotteryTo(lottery, adminAddr, file_sender);
            }
        });
}

async function transferTokenFromLotteryTo(lottery, adminAccount, account) {
    const txn = lottery.increase(account, 30000, { from: adminAccount });
    const r = await txnUtils.getReceiptPromise(web3, txn, 60);
    log(`txn: ${txn}, r.logs: ${r.logs}`);
    const gap = await txnUtils.retryPromise(
        () => {
            return confirmTokenTransferred(fileToken, account);
        });
    if (!gap) {
        console.error(`Failed to increase increase for ${account} during deploy.`);
    }

}

function confirmTokenTransferred(fileToken, acc) {
    let balance = fileToken.balanceOf(acc).toNumber();
    log(`balance of ${acc}`, balance);
    return balance && balance === 30000;
}

async function increaseEscrow(acc) {
    const initE = lottery.getEscrow(acc);
    const txn = lottery.increase({ from: acc, value: web3.toWei('10', 'ether') });
    const r = await txnUtils.getReceiptPromise(web3, txn, 60);
    log(`txn: ${txn}, r: ${r}`);

    const gap = await txnUtils.retryPromise(
        () => {
            let e2 = lottery.getEscrow(acc);
            log(`e2: ${e2}`);
            return web3.fromWei(e2.minus(initE), "ether").toNumber() === 10;
        },
        15);
    if (!gap) {
        console.error("Failed to increase escrow for account 1 during deploy.");
    }
}

