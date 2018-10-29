pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Lottery.sol";

contract TestLottery {
    // function testRedeemLottery() public {
    //     Lottery instance = Lottery(DeployedAddresses.Lottery());
    //     bytes memory lottery = hex"001E6c4c3d32407621297459773731385424646f5b7c62292a6d2e39255b4d2e21e765a9a9dfebcbe94d520a2bb225cfc9c8345f330a9dd1e987b8b14d0638307c8c7a481a3dac2431745ce9b18b3bb8b6c526e7000001659a693424";
    //     bytes memory sig = hex"393f2778c4f908edbb6c456960fecc877d57c5e3b5c85e06601e30cb601481c6517400aef340363cefee5f38f6fdfc082ff1b0945ca7465ae0a2e814b97173211c";
    //     bytes memory winningData = hex"5b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c";
    //     //string memory rs1 = "[B$'4d~x3>1d{it4`{DXM~S]+Y#q-,";
    //     //string memory rs2 = "}KMs97a:E4@D8X#LW83N8TI{CE0}[P";
    //     //bytes32 hrs1 = sha256(rs1);
        
    //     //Assert.equal(hrs1, 0x00, "wrong sig");
    //     bool ret = instance.redeemLottery(lottery, sig, winningData);
    //     Assert.isTrue(ret, "invalid lottery or its signature.");
    // }

    function testSplitLottery() public {
        Lottery instance = Lottery(DeployedAddresses.Lottery());

        bytes memory lottery = hex"011e6e697624474e36235572596a34703321456d57314c727044296a37566c3ee4651f72205b9246939d307b213f61e3eeadfb0a8b1717b41f0ab1c12bf12e777c8c7a481a3dac2431745ce9b18b3bb8b6c526e700000166af0bd869100000000000000000000000000000000000001100000000000000000000000000000000000000000000000000000000000003e80a";
        //0x011e6e697624474e36235572596a34703321456d57314c727044296a37566c3ee4651f72205b9246939d307b213f61e3eeadfb0a8b1717b41f0ab1c12bf12e777c8c7a481a3dac2431745ce9b18b3bb8b6c526e700000166af0bd869100000000000000000000000000000000000001100000000000000000000000000000000000000000000000000000000000003e80a
        (bytes1 ver, bytes memory rs2, bytes32 hashRs1, address dest, uint64 time, address token_addr, uint256 faceValue, uint8 power) = instance.splitLottery1(lottery); 
        Assert.equal(ver, bytes1(0x01), "Version mismatches.");
        bytes memory expected_rs2 = hex"6e697624474e36235572596a34703321456d57314c727044296a37566c3e";
        Assert.equal(string(rs2),  string(expected_rs2), "rs2 does not match.");
        Assert.equal(hashRs1, hex"e4651f72205b9246939d307b213f61e3eeadfb0a8b1717b41f0ab1c12bf12e77", "Hash of rs1 does not match.");
        address expected_dest = 0x7c8c7A481a3dAc2431745Ce9b18B3BB8b6C526e7;
        Assert.equal(dest, expected_dest, "The winner address does not match.");
        uint64 expected_timeStamp = 1540535081065;
        Assert.equal(uint256(time), uint256(expected_timeStamp), "The timestamp does not match");
        address expected_token_addr = 0x1000000000000000000000000000000000000011;
        Assert.equal(token_addr, expected_token_addr, "The token_addr does not match");
        Assert.equal(faceValue, 1000, "The face value does not match.");
        Assert.equal(uint256(power), uint256(10), "The power does not match.");
    }

    // function testIncreaseAndGetEscrow() public {
    //      Lottery instance = Lottery(DeployedAddresses.Lottery());
         
    // }
}