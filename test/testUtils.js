'use strict'


function getReceiptPromise(web3, tx, timeout) {
    return new Promise(function (resolve, reject) {
        let times = Math.ceil(timeout / 5)
        delayedGetReceipt(web3, tx, resolve, reject, timeout, times);
    })
}

function delayedGetReceipt(web3, tx, resolve, reject, timeout, maxTimes, level = 1) {
    if (maxTimes <= 0) {
        reject();
        return;
    }
    let receipt = web3.eth.getTransactionReceipt(tx);
    console.log(level + "th trying to get tx receipt")
    if (!receipt) {
        setTimeout(function () {
            receipt = delayedGetReceipt(web3, tx, resolve, reject, timeout, --maxTimes, ++level)
        }, 5000
        )
    } else {
        resolve();
    }

    return receipt;
}

module.exports = getReceiptPromise
