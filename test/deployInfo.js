const fs = require('fs')
const testUtils = require('./testUtils');

const log = testUtils.logMagenta("deployInfo");

const deployedFolder = 'deployed';
const fn = deployedFolder + '/' + 'deployed.json';
let fileContent;

let cached;
function getContracts(web3, t) {
    if (cached) return cached;
    const contractsInfo =getDeloyedFileContent(t);

    const lotteryInfo = contractsInfo.lottery;
	console.log(`Got Lottery contract address ${lotteryInfo.addr}`);
	let lotteryContract = web3.eth.contract(lotteryInfo.abi);
    let lottery = lotteryContract.at(lotteryInfo.addr);

    let fileTokenContract = web3.eth.contract(contractsInfo.fileToken.abi);
    let fileToken = fileTokenContract.at(contractsInfo.fileToken.addr);

    cached = {lottery: lottery, fileToken: fileToken};
	return cached;
}

function getDeloyedFileContent(t)
{
    if (fileContent) {
        return fileContent;
    } else {
        if (!fs.existsSync(fn)) {
            t.fail("contract deployed file does not exist.");
        }
        const fc = fs.readFileSync(fn);
        if (!fc) {
            t.fail("no content in the contract deployed file.");
        }
        fileContent = JSON.parse(fc);
        return fileContent;
    }
}

function deployLotteryContractPromise(testName, web3, adminAddr)
{
    const contractsInfo =getDeloyedFileContent();
    const lotteryInfo = contractsInfo.lottery;
    const fileTokenInfo = contractsInfo.fileToken;

    return new Promise(
        function(resolve, reject) {
            lotteryContract = web3.eth.contract(lotteryInfo.abi);
            lottery = lotteryContract.new(
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
                            resolve({ lottery: lottery, fileToken: fileToken});
                        }
                    }
                }
            );
        }
    );
}
// async function transferTokenFromLotteryTo(web3, lottery, adminAccount, account, amount = 30000) {
//     log("calling  transferTokenFromLotteryTo")
//     const txn = lottery.increase(account, amount, { from: adminAccount });
//     const r = await txnUtils.getReceiptPromise(web3, txn, 60);
//     log(`txn: ${txn}, r.logs: ${r.logs}`);
//     const gap = await txnUtils.retryPromise(
//         () => {
//             return confirmTokenTransferred(fileToken, account);
//         }, 15);
//     if (!gap) {
//         console.error(`Failed to increase increase for ${account} during deploy.`);
//     }
// }

// function confirmTokenTransferred(fileToken, acc) {
//     let balance = fileToken.balanceOf(acc).toNumber();
//     log(`balance of ${acc}`, balance);
//     return balance && balance === 30000;
// }

module.exports.getContracts = getContracts;
module.exports.deployLotteryContractPromise = deployLotteryContractPromise
module.exports.deployedFolder = deployedFolder;
module.exports.fn = fn;