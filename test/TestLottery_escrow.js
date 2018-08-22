var Lottery = artifacts.require("Lottery");


contract('Lottery', function(accounts){
    it("should be 0 balance for every account",function() {
        return Lottery.deployed().then(function(instance){
            return instance.getEscrow.call(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "the first account has more than 0 eth at first.")
        });
    });

    it("test increase and get escrow", async() => {
        var account = accounts[0];
        let instance = await Lottery.deployed();
        //console.log(instance);
        let txHash = await instance.increase.sendTransaction({from:account, gas: 3000000, value:10000});
        var trans = web3.eth.getTransactionReceipt(txHash);
        // console.log(trans);
        let balance = await instance.getEscrow.call(account);
        assert.equal(balance, 10000);
        await instance.increase.sendTransaction({from:account, gas: 3000000, value:10000});
        balance = await instance.getEscrow.call(account);
        assert.equal(balance, 20000);
        balance = await instance.increase.call({}, {value: 100000});
        assert.equal(balance, 120000);
    });

    it("redeem a valid winning lottery", async() => {

    });
})