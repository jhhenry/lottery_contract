var Lottery = artifacts.require("./Lottery.sol");

module.exports = function(deployer) {
  console.log("Deloying Lottery contract")
  deployer.deploy(Lottery);
};
