const fs = require('fs')
const testUtils = require('./testUtils');

const log = testUtils.logMagenta("deployInfo");

const deployedFolder = 'deployed';
const fn = deployedFolder + '/' + 'deployed.json';
//var fileContent;

let cached;
function getContracts(web3, t) {
    // The cache here does not really works.
    if (cached) return cached;
    const contractsInfo = getDeloyedFileContent(t);

    const lotteryInfo = contractsInfo.lottery;
    console.log(`Got Lottery contract address ${lotteryInfo.addr}`);
    let lotteryContract = web3.eth.contract(lotteryInfo.abi);
    let lottery = lotteryContract.at(lotteryInfo.addr);

    let fileTokenContract = web3.eth.contract(contractsInfo.fileToken.abi);
    let fileToken = fileTokenContract.at(contractsInfo.fileToken.addr);

    cached = { lottery: lottery, fileToken: fileToken };
    return cached;
}

function getDeloyedFileContent(t) {
    // The cache here does not really works.
    // let fileContent = global.fileContent;
    // if (fileContent) {
    //     return fileContent;
    // } else {
    log("Reading contracts file.")
    if (!fs.existsSync(fn)) {
        t.fail("contract deployed file does not exist.");
    }
    const fc = fs.readFileSync(fn);
    if (!fc) {
        t.fail("no content in the contract deployed file.");
    }
    fileContent = JSON.parse(fc);
    return fileContent;
    // }
}

function deploy(web3, adminAddr, contracts /** Array<Object{name, c_args[]}> */, options /** {testName} */) {
    const contractsInfo = getDeloyedFileContent();
    const contractsToBeDeloyed = new Map();
    contracts.forEach(item => {
        const value = contractsInfo[item.name];
        value.c_args = item.c_args;
        contractsToBeDeloyed.set(item.name, value);
    });
    const promises = [];
    contractsToBeDeloyed.forEach((v, k) => {
        promises.push(new Promise(
            function (resolve, reject) {
                let contractAbi = web3.eth.contract(v.abi);
                const cb = function (e, contract) {
                    if (e) {
                        reject(e);
                    } else {
                        if (typeof contract.address !== 'undefined') {
                            log(`Delolyed ${k} contract for the test, "${options.testName}", at: ${newContract.address}, txn: ${newContract.transactionHash}`);
                            resolve({ [k]: newContract });
                        }
                    }
                };
                const send_options = { from: adminAddr, data: v.bytecode, gas: '4700000' }
                log(`deploying contract ${k}`)
                let newContract = v.c_args && v.c_args.length > 0 ? contractAbi.new(...v.c_args, send_options, cb) : contractAbi.new(send_options, cb);
            }
        ))
    }
    );
    return Promise.all(promises);
}

/** It deploys the Lottery contract of version 0. According to the implementation of this contract, a fileToken contract is created every time of its construction. */
function deployLotteryContractPromise(testName, web3, adminAddr) {
    const contractsInfo = getDeloyedFileContent();
    const lotteryInfo = contractsInfo.lottery0;
    const fileTokenInfo = contractsInfo.filetoken;

    return new Promise(
        function (resolve, reject) {
            let lotteryContract = web3.eth.contract(lotteryInfo.abi);
            let lottery = lotteryContract.new(
                {
                    from: adminAddr,
                    data: lotteryInfo.bytecode,
                    gas: '4700000'
                },
                function (e, contract) {
                    if (e) {
                        reject(e);
                    } else {
                        if (typeof contract.address !== 'undefined') {
                            log(`Delolyed Lottery contract for the test, "${testName}", at: ${contract.address}, txn: ${contract.transactionHash}`);
                            // log(`contract: ${contract}`);
                            // Object.keys(lottery).forEach(prop => log(`${prop}: ${lottery[prop]}`));
                            let fileTokenAddr = lottery.fileToken();
                            log(`"${testName}" fileTokenAddr:`, fileTokenAddr);
                            let fileTokenContract = web3.eth.contract(fileTokenInfo.abi);
                            let fileToken = fileTokenContract.at(fileTokenAddr);
                            resolve({ lottery: lottery, fileToken: fileToken });
                        }
                    }
                }
            );
        }
    );
}

module.exports.getContracts = getContracts;
module.exports.deployLotteryContractPromise = deployLotteryContractPromise
module.exports.deploy = deploy;
module.exports.deployedFolder = deployedFolder;
module.exports.fn = fn;