
function retryPromise(doSth, timeout = 15) {
	return new Promise((resolve, reject) => {
		let times = Math.ceil(timeout/ 5);
		retrySth(doSth, resolve, reject, timeout, times);
	});
}

function retrySth(doSth, resolve, reject, timeout, maxTimes, level = 1) {
	
	let receipt = doSth();
	if (!receipt) {
		//console.log("wait for result:", receipt);
		if (maxTimes <= 0) {
			reject(receipt);
			return;
		}

		setTimeout(
			function () {
				retrySth(doSth, resolve, reject, timeout, --maxTimes, ++level)
			},
			5000
		)
	} else {
		resolve(receipt);
	}
}

function getReceiptPromise(web3, tx, timeout = 15) {
	return retryPromise(
		() => {
			let receipt = web3.eth.getTransactionReceipt(tx);
			return receipt;
		},
		timeout
	);
};

class TransactionRunner {
    constructor(web3, log) {
        this.web3 = web3;
        this.log = log;
        this.gas = 200000;
    }

    async syncRun(contractFunc, from, ...funcArgs) {
        const log = this.log;
        const web3 = this.web3;
        const txn = from ? contractFunc(...funcArgs, {from: from, gas: this.gas }) : contractFunc(...funcArgs);
        const r =  await getReceiptPromise(web3, txn, 30);
        // Object.keys(contractFunc.name).forEach(prop => log(`${prop} => ${contractFunc[prop]}`));
        log(`executed txn:`,  txn);
        return {txn: txn, receipt: r};
    }

    setGas(gas) {
        this.gas = gas;
        return this;
    }
}



module.exports.retryPromise = retryPromise;

module.exports.getReceiptPromise = getReceiptPromise;
module.exports.TransactionRunner = TransactionRunner;