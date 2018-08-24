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
        console.log("account:" + account)
        let instance = await Lottery.deployed();
        await instance.increase.call({}, {from:account, gas: 3000000, value:10000});
        let balance = await instance.getEscrow.call(account);
        console.log("balance is " + balance.toString(10));
        assert.equal(balance, 10000);
        await instance.increase.sendTransaction({from:account, gas: 3000000, value:10000});
        balance = await instance.getEscrow.call(account);
        assert.equal(balance, 20000);
    });

    it("redeem a valid winning lottery", async() => {
        // var rs1 = "[B$'4d~x3>1d{it4`{DXM~S]+Y#q-,";
        // var rs2 = "}KMs97a:E4@D8X#LW83N8TI{CE0}[P";
        // var hashRs1Rs2 = sha256(rs1 + rs2);
        var lottery = "0x0014145b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c7d4b4d733937613a453440443858234c5738334e3854497b4345307d5b50b86ade9b45dd5510d5337078d55df2e73e6bdf0d81fb0d16fc186ccb27d8b18cd0bc2224aa63b226220b8d1bb8c40ebdcf13668d"; // in hex


        //new lottery data:  "0x001E7d4b4d733937613a453440443858234c5738334e3854497b4345307d5b50b86ade9b45dd5510d5337078d55df2e73e6bdf0d81fb0d16fc186ccb27d8b18c1f1350fa79d4fd32367c8f9eb138c50fc25a1d6c"

        var hash = web3.sha3(lottery, {encoding:'hex'});
        var sig = web3.eth.sign(accounts[0], hash);
        console.log(typeof hash)
        console.log(sig)

        let instance = await Lottery.deployed();
        console.log("Going to call verify...")
        let ret = await instance.verify.call(lottery, sig);
        console.log("Calling verify...")
        console.log(ret);
        assert.equal(ret, true);
        
    });
})