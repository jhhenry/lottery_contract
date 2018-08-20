var Lottery = artifacts.require("Lottery");


contract('Lottery', function(accounts){
    it("should be 0 balance for every account",function() {
        return Lottery.deployed().then(function(instance){
            return instance.getEscrow.call(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "the first account has more than 0 eth at first.")
        });
    });
})