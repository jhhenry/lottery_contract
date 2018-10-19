
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

module.exports.retryPromise = retryPromise;

module.exports.getReceiptPromise = function(web3, tx, timeout = 15) {
	return retryPromise(
		() => {
			let receipt = web3.eth.getTransactionReceipt(tx);
			return receipt;
		},
		timeout
	);
};


