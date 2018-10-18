const Lottery = artifacts.require("Lottery");
const FileToken = artifacts.require("FileToken");


contract("FileToken tests", function (accounts) {
    let adminAddr;
    let file_receiver = accounts[1];
    let file_sender = accounts[2];
    let fileToken;
    let lottery;
    it("Initialize and increase test", function () {
        return Lottery.deployed().then(function (instance) {
            assert.ok(instance, "cannot get lottery contract")
            lottery = instance;
            return lottery.fileToken();
        }).then(function (instance) {
            assert.ok(instance, "cannot get tokenFile contract");
            let addr = instance;
            console.log("\x1b[34m%s\x1b[0m", "Deloy contract token at: ", addr);
            assert.ok(FileToken.abi, "abi is null");
            fileToken = web3.eth.contract(FileToken.abi).at(addr);
            assert.ok(fileToken, "cannot init fileToken instance.");

            adminAddr = fileToken.adminAddr();
            console.log(`\x1b[34madminAddr, that is, the creator of the contract:\x1b[0m ${adminAddr}`);
            console.log(`\x1b[34mfile_receiver account:\x1b[0m ${file_receiver}`);
            assert.equal(adminAddr, accounts[0], "Admin should be the first account in the geth node.")

            let adminBalance = fileToken.balanceOf(adminAddr);
            console.log("\x1b[34m%s\x1b[0m", `adminBalance: ${adminBalance}`);
            assert.equal(adminBalance, 0, "The initial balance of the admin account should be zero")

            let lotteryAddr = fileToken.lotteryAddr();
            assert.equal(lotteryAddr, lottery.address, "the lottery contract should be the same as the one in the token.")
            let lotteryBalance = fileToken.balanceOf(lotteryAddr);
            console.log("\x1b[34m%s\x1b[0m", `lotteryBalance: ${lotteryBalance}`);

            // assume the accounts[1] buy some tokens. After the system confirm the purchase,
            // 1. the system admin call increase method to transfer tokens from lottery contract account to the accounts[1]

            /** test case 1.1: use accounts[1] to call the increase method */
            return lottery.increase(file_receiver, 10000, { from: file_receiver });

            // 2. the accounts need to do two things:
            //      2.a The file_receiver approves that the lottery contract can transfer a certain amount of money to any accounts on his behalf.
            //      2.b The file_sender turn in a pledge in the tokens that will be locked, underneath these tokens will be temporarily transfered to the admin's account.

            // 3. every time the lottery contract's transfer method is called, it will check if the from_account has pledge.
        }).then(
            function (tx) {
                assert.fail("use file_receiver to call the increase method should failed");
            },
            function (err) {
                assert.ok(err);
                console.log("\x1b[34m%s\x1b[0m", `The transaction of calling increase with file_receiver failed expectedly.`);
                /** test case 1.2: use adminAddr to call the increase method */
                return lottery.increase(file_receiver, 10000, { from: adminAddr });
            }
        ).then(
            function (tx) {
                console.log(`\x1b[34madmin call increase method transaction:\x1b[0m ${tx.tx}`);
                return fileToken.balanceOf.call(file_receiver);
            },
            function (err) {
                console.log("\x1b[31m%s\x1b[0m", `The transaction of calling increase with adminAddr failed: ${err}`);
                assert.fail();
            }
        ).then(
            function (r) {
                assert.equal(r, 10000, `\x1b[31mThe file receiver does not accept expected amount of tokens\x1b[0m. Actual is ${r}`);
                return lottery.increase(file_receiver, 10000, { from: adminAddr });
            }
        ).then(
            function (tx) {
                console.log(`\x1b[34madmin call increase method transaction for a second time:\x1b[0m ${tx.tx}`);
                return fileToken.balanceOf.call(file_receiver);
            }
        ).then(
            function (r) {
                assert.equal(r, 20000, `\x1b[31mThe file receiver does not accept expected amount of tokens\x1b[0m. Actual is ${r}`);
            }
        )
    });
    it("approves test", function () {
        return Lottery.deployed().then(function (instance) {
            assert.ok(instance, "cannot get lottery contract")
            return fileToken.approve(lottery.address, 5000, { from: file_receiver });
        }
        ).then(
            function (tx) {
                let allowance = fileToken.allowance.call(file_receiver, lottery.address);
                assert.equal(allowance.toNumber(), 5000, `\x1b[31mThe lottery account should have 5000 tokens to spend on behalf of the file_receiver.\x1b[0m. But the atual is ${allowance.toNumber()}.`);
            }
        )
    });
    /**      2.b The file_sender turns in a pledge in the tokens that will be locked, underneath these tokens will be temporarily transfered to the admin's account. */
    it("turn in pledge test", function () {
        let initBalance;
        return Lottery.deployed().then(function (instance) {
            assert.ok(instance, "cannot get lottery contract");
            return lottery.redeemLottery(file_receiver, 1000, { from: file_sender });
        }
        ).then(
            function (r) {
                assert.fail("redeemLottery should have failed due to insufficient pledge.")
            },
            function (err) {
                initBalance = fileToken.balanceOf.call(adminAddr);
                console.log(`\x1b[34minitBalance of the admin account:\x1b[0m ${initBalance}`);
                return fileToken.turnInPledge(10000, { from: file_sender });
            }
        ).then(
            function (tx) {
                console.log(`\x1b[34mfile_sender call turnInPledge method transaction:\x1b[0m ${tx.tx}.`);
                assert.fail("First call to turnInPledge should have failed for the file sender.", `tx: ${tx.tx}`);
            },
            function (err) {
                assert.ok("First call to turnInPledge failed expectedly for the file sender.");
                let balance = fileToken.balanceOf(adminAddr);
                assert.equal(balance.toNumber() - initBalance.toNumber(), 0);
                return lottery.increase(file_sender, 30000, { from: adminAddr });
            }
        ).then(
            function (tx) {
                console.log(`\x1b[34madmin call increase method transaction for the file_sender:\x1b[0m ${tx.tx}`);
                let balance = fileToken.balanceOf.call(file_sender);
                assert.equal(balance.toNumber(), 30000, `the file_sender should have 30000 tokens now.`);
                return fileToken.turnInPledge(10000, { from: file_sender });
            }
        ).then(
            function (tx) {
                console.log(`\x1b[34mfile_sender call turnInPledge method transaction:\x1b[0m ${tx}.`);
                let pledge = fileToken.getPledge(file_sender);
                assert.equal(pledge.toNumber(), 10000);
                let balance = fileToken.balanceOf(adminAddr);
                assert.equal(balance.toNumber() - initBalance.toNumber(), 10000);
                return fileToken.turnInPledge(10000, { from: file_sender });
            }
        ).then(
            function (tx) {
                console.log(`\x1b[34mfile_sender call turnInPledge method transaction for a second time:\x1b[0m ${tx}.`);
                let pledge = fileToken.getPledge(file_sender);
                assert.equal(pledge.toNumber(), 20000);

                let balance = fileToken.balanceOf(adminAddr);
                assert.equal(balance.toNumber() - initBalance.toNumber(), 20000);
            }
        )
    });

    /** 3. every time the lottery contract's transfer method is called, it will check if the from_account has pledge.
     */
    // it("Redeem test", function () {
    //     let balanceOfFile_sender;
    //     let balanceOfFile_receiver;
    //     let lotteryData = "0x001E6c4c3d32407621297459773731385424646f5b7c62292a6d2e39255b4d2e21e765a9a9dfebcbe94d520a2bb225cfc9c8345f330a9dd1e987b8b14d0638307c8c7a481a3dac2431745ce9b18b3bb8b6c526e7000001659a693424";
    //     let sig = web3.eth.sign(file_receiver, web3.sha3(lotteryData, { encoding: "hex" }));
    //     let rs1 = "0x5b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c";
    //     return Lottery.deployed().then(
    //         function (instance) {
    //             assert.ok(instance, "cannot get lottery contract")
    //             balanceOfFile_sender = fileToken.balanceOf(file_sender);
    //             balanceOfFile_receiver = fileToken.balanceOf(file_receiver);
    //             console.log(`\x1b[34minitBalance of the file_sender account:\x1b[0m ${balanceOfFile_sender}`);
    //             console.log(`\x1b[34minitBalance of the file_receiver account:\x1b[0m ${balanceOfFile_receiver}`);

    //             // Make sure the verifySig that returns the signing account works.
    //             return lottery.verifySig.call(sig, lotteryData);
    //         }
    //     ).then(
    //         function (r) {
    //             let addr = r;
    //             console.log(`addr: ${r}`);
    //             assert.equal(addr, file_receiver, "VerifySig did not return the expected address.");
    //             return lottery.redeemLottery(file_receiver, 1000, { from: file_sender });
    //         }
    //     ).then(
    //         function (tx) {
    //             let orig = balanceOfFile_sender;
    //             balanceOfFile_sender = fileToken.balanceOf(file_sender);
    //             console.log(`\x1b[34mBalance of the file_sender account:\x1b[0m ${balanceOfFile_sender}`);
    //             assert(balanceOfFile_sender - orig, 1000);

    //             orig = balanceOfFile_receiver;
    //             balanceOfFile_receiver = fileToken.balanceOf(file_receiver);
    //             console.log(`\x1b[34mBalance of thefile_receiver account:\x1b[0m ${balanceOfFile_receiver}`);
    //             assert(orig - balanceOfFile_receiver, 1000);
    //         }
    //     );
    // });
});