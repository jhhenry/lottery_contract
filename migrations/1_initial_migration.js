var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, addresses) {
 // console.log(web3.eth.accounts);
  // if (network == 'privatenet') {
  //   console.log("unlocking accounts");
  //   web3.personal.unlockAccount(addresses[0], "highsharp", 36000);
  //   web3.personal.unlockAccount(addresses[1], "highsharp", 36000);
  // }
  // var accounts = web3.eth.accounts;
  // var pwd = "highsharp"
  // var acc = web3.personal.newAccount(pwd);
  // web3.personal.unlockAccount(acc, pwd);
  // console.log(web3.eth.accounts);
  // web3.eth.sendTransaction({from:accounts[2], to:acc, value:1e18})
  deployer.deploy(Migrations);
  console.log('>> Deployed migration 1');
 
};// 
