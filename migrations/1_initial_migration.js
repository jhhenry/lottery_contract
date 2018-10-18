var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
    console.log(`using network: ${network}`);
    if (network === 'privatenet') {
        for (let i = 0; i < accounts.length; i++) {
            web3.personal.unlockAccount(accounts[i], 'highsharp', 36000);
        }
    }
  deployer.deploy(Migrations);
};

