var Lottery = artifacts.require("Lottery");
//console.log(Lottery._json.abi)


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
        await instance.increase.sendTransaction({from:account, gas: 3000000, value:10000});
        //sleep(120000)
        let balance = await instance.getEscrow.call(account);
        //printProperty("", balance, 1);
        console.log(balance.toNumber())
        assert.equal(balance.toNumber(), 10000);
        await instance.increase.sendTransaction({from:account, gas: 3000000, value:10000});
        balance = await instance.getEscrow.call(account);
        assert.equal(balance.toNumber(), 20000);
    });

    it("redeem a valid winning lottery", async() => {
        // var rs1 = "[B$'4d~x3>1d{it4`{DXM~S]+Y#q-,";
        // var rs2 = "}KMs97a:E4@D8X#LW83N8TI{CE0}[P";
        // var hashRs1Rs2 = sha256(rs1 + rs2);
        var lottery = "0x001E6431717c59363a50646d574859313744624f216760273f7776757b4d2e73317e1182f62a955474f1f103b6b5f3c1340d0289ac915731b28849409432fa187c8c7a481a3dac2431745ce9b18b3bb8b6c526e7000001659a693424"
        // var sig = "0x6eb8c06328667b50ca35e566caae5bee9c68e4333643ec813f987a23b9e112fc06d01cf3caec30aea00841d950bad700c25ddd512dacd58493aa9655cd9e85a71c"
        var rs1 = "0x71392d366928704e66727e62265067425e4a2f6c34413f5e6d3672386f49"

        //new lottery data:  "0x001E7d4b4d733937613a453440443858234c5738334e3854497b4345307d5b50b86ade9b45dd5510d5337078d55df2e73e6bdf0d81fb0d16fc186ccb27d8b18c1f1350fa79d4fd32367c8f9eb138c50fc25a1d6c"

        // var hash = web3.sha3(lottery, {encoding:'hex'});
        var lastAccount = web3.eth.accounts[0];
        var sig = web3.eth.sign(lastAccount, lottery);
        // console.log(typeof hash) 
        console.log("lastAccount: " + lastAccount + ", sig: " + sig)

        let instance = await Lottery.deployed();
        console.log("Going to call verify...")
        let ret = await instance.verify.call(lottery, sig, rs1, {from:accounts[0], gas: 300000});
        console.log("Calling verify...")
        console.log(ret);
        assert.equal(ret, true);

    });

    it("withdraw and withdrawAll", async() => {
        var creator = accounts[0];
        var account = accounts[1];
        console.log("account:" + account)
        let instance = await Lottery.deployed();
        await instance.increase.sendTransaction({from : account, gas : 3000000, value : web3.toWei(101, "finney")});

        await instance.withdraw.call(web3.toWei(10, "finney"));

    });
})

function printProperty( prefix,  o, level) {
    //console.log(o)
    if (level > 3) return;
    for (const prop in o) {
        var f = o[prop];
        if (typeof f === 'function') {
            console.log("Function: " + f.name)
                continue
        }
        //if (typeof f == 'string') continue
        if (o.hasOwnProperty(prop)) {
            console.log(prefix + (typeof f) + ", " + prop + ": " + f)
            if(f) {
                printProperty(prefix + "\t", f, level + 1);
            }
        }
        
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}