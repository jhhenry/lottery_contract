const fs = require('fs')
const web3 = require('./web3Utils');
const testUtils = require('./testUtils');
const deployInfo = require('./deployInfo');
const compile = require('./compile');

const log = testUtils.logBlue("preTest.js");

const deployedFolder = deployInfo.deployedFolder;
const fn = deployInfo.fn;

const accounts = web3.eth.accounts;

/* create the 'deployed' folder */
if (!fs.existsSync(deployedFolder)) {
    fs.mkdirSync(deployedFolder);
}

if (fs.existsSync(fn)) {
    fs.unlinkSync(fn);
}

/* compile the latest Lottery contracts. */
let compiled = compile.compileLotteryContract();


/**
 * 1. Unlock all accounts.
 * 2. write contracts' info to a file
 */
unLockAllAccounts();
writeContractsInfoFile();
//deloyLotteryContract();

function unLockAllAccounts() {
    for (let acc of accounts) {
        if (!web3.personal.unlockAccount(acc, 'highsharp', 36000)) {
            console.error(`failed to unlock account: ${acc}`);
        }
    }
}

function writeContractsInfoFile()
{
    fs.appendFile(fn, JSON.stringify(compiled), err => {
        if (err) throw err;
        log("Written compiled contracts info to the delpoyed file.")
    });
}