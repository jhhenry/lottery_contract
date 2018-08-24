var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, addresses) {
  //console.log(this);
  // if (network == 'privatenet') {
  //   console.log("unlocking accounts");
  //   web3.personal.unlockAccount(addresses[0], "highsharp", 36000);
  //   web3.personal.unlockAccount(addresses[1], "highsharp", 36000);
  // }
  deployer.deploy(Migrations);
  console.log('>> Deployed migration');
 
};// 
