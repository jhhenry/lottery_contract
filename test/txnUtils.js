
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

function getReceiptsPromise(web3, txs, timeout = 15) {
	return retryPromise(
		() => {
            const receipts = new Map();
            txs.forEach(tx => {
                let receipt = web3.eth.getTransactionReceipt(tx);
                if (receipt) {
                    receipts.set(tx, receipt);
                }
            })
		
			return receipts.size == txs.length ? receipts : null ;
		},
		timeout
	);
};

class TransactionRunner {
    constructor(web3, log) {
        this.web3 = web3;
        this.gas = 300000;
        this.value = 0;
    }

    async syncRun(contractFunc, from, ...funcArgs) {
        const web3 = this.web3;
        const value = this.value;
        this.value = 0; // should not affect next run
        const txn = from ? contractFunc(...funcArgs, {from, gas: this.gas, value }) : contractFunc(...funcArgs);
        const r =  await getReceiptPromise(web3, txn, 30);
        // Object.keys(contractFunc.name).forEach(prop => log(`${prop} => ${contractFunc[prop]}`));
        return {txn: txn, receipt: r};
    }
    
    async syncBatchRun(vargs)
    {
        const transactions = [];
        const web3 = this.web3;
        const value = this.value;
        if (vargs.forEach) {
            vargs.forEach(item => {
                const {contractFunc, from, funcArgs} = item;
                const txn = contractFunc(...funcArgs, {from, gas: this.gas, value });
                transactions.push(txn);
            });
            const receipts = await getReceiptsPromise(web3, transactions, 25);
            const r = [];
            transactions.forEach((txn) => {
                r.push({txn, receipt: receipts.get(txn)});
            });
            return r;
        }
    }

    setGas(gas) {
        this.gas = gas;
        return this;
    }

    setValue(v) {
        this.value = v;
        return this;
    }
}



module.exports.retryPromise = retryPromise;

module.exports.getReceiptPromise = getReceiptPromise;
module.exports.TransactionRunner = TransactionRunner;