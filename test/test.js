'use strict'
var getReceiptPromise = require('./testUtils.js')
var Web3 = require('web3')
if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider);
   } else {
    // set the provider you want from Web3.providers
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8565"));
}
// console.log(web3);

//web3.eth.getAccounts(console.log)
console.log("web3 version: " + web3.version.api)
var accounts = web3.eth.accounts
console.log("accounts: " + accounts)
// web3.personal.unlockAccount(accounts[0], 'highsharp', 36000)
// web3.personal.unlockAccount(accounts[1], 'highsharp', 36000)
// web3.personal.unlockAccount(accounts[2], 'highsharp', 36000)

var lottery_issuer = accounts[0];
var lottery_redeemer = accounts[1];

var jsonInterface = [{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"lottery","type":"bytes"}],"name":"splitLottery","outputs":[{"name":"ver","type":"bytes1"},{"name":"rs2","type":"bytes"},{"name":"hashRs1","type":"bytes32"},{"name":"addr","type":"address"},{"name":"time","type":"uint64"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"unLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"getEscrow","outputs":[{"name":"deposite","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"ver","type":"uint8"},{"name":"hashRs1Rs2","type":"bytes32"},{"name":"rs2","type":"bytes"}],"name":"verifyLottery","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"lottery","type":"bytes"},{"name":"signature","type":"bytes"},{"name":"winningData","type":"bytes"}],"name":"verify","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"increase","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"withdrawAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"lottery","type":"bytes"},{"indexed":false,"name":"sig","type":"bytes"},{"indexed":false,"name":"winningData","type":"bytes"},{"indexed":false,"name":"sender","type":"address"}],"name":"VerifyLottery","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"lottery","type":"bytes"},{"indexed":false,"name":"issuingTime","type":"uint64"},{"indexed":false,"name":"faceValue","type":"uint256"},{"indexed":false,"name":"issuer","type":"address"},{"indexed":false,"name":"winner","type":"address"}],"name":"RedeemedLotttery","type":"event"}]
var lotteryContract = web3.eth.contract(jsonInterface)
var lottery = lotteryContract.at("0x242a56af95e1092c28c38e2ce27d3d7825c89a02")
var initE = lottery.getEscrow(lottery_issuer);
console.log("init escrow of the lottery issuer: " + web3.fromWei(initE, 'ether'))
var increaseTx = lottery.increase({from:lottery_issuer, value:web3.toWei('10', 'ether')})
console.log("increase txn id: " + increaseTx)
let escrow0 = lottery.getEscrow(lottery_issuer);
getReceiptPromise(web3, increaseTx, 60)
.then(()=>{escrow0 = lottery.getEscrow(lottery_issuer);console.log("after increase, the escrow of account 0 is: " + web3.fromWei(escrow0, 'ether'));})
.catch(() => {console.error("no receipt!")})


// let trycount = 1;
// while(!receipt && trycount < 100) {
//     receipt = web3.eth.getTransactionReceipt(increaseTx);
//     trycount++;
// }



// var lottery = lotteryContract.new(
//    {
//      from: web3.eth.accounts[0], 
//      gas: '4700000'
//    }, function (e, contract){
//     console.log(e, contract);
//     if (typeof contract.address !== 'undefined') {
//          console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
//     }
//  })