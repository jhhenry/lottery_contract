const Web3 = require('web3')

const addr = process.env.web3Addr? process.env.web3Addr: "http://localhost:8565";
console.log("connecting to", addr);
if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider);
   } else {
    // set the provider you want from Web3.providers
    var web3 = new Web3(new Web3.providers.HttpProvider(addr));
}

module.exports = web3;
