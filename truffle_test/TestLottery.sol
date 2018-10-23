pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Lottery.sol";

contract TestLottery {
    function testRedeemLottery() public {
        Lottery instance = Lottery(DeployedAddresses.Lottery());
        bytes memory lottery = hex"001E6c4c3d32407621297459773731385424646f5b7c62292a6d2e39255b4d2e21e765a9a9dfebcbe94d520a2bb225cfc9c8345f330a9dd1e987b8b14d0638307c8c7a481a3dac2431745ce9b18b3bb8b6c526e7000001659a693424";
        bytes memory sig = hex"393f2778c4f908edbb6c456960fecc877d57c5e3b5c85e06601e30cb601481c6517400aef340363cefee5f38f6fdfc082ff1b0945ca7465ae0a2e814b97173211c";
        bytes memory winningData = hex"5b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c";
        //string memory rs1 = "[B$'4d~x3>1d{it4`{DXM~S]+Y#q-,";
        //string memory rs2 = "}KMs97a:E4@D8X#LW83N8TI{CE0}[P";
        //bytes32 hrs1 = sha256(rs1);
        
        //Assert.equal(hrs1, 0x00, "wrong sig");
        bool ret = instance.verify(lottery, sig, winningData);
        Assert.isTrue(ret, "invalid lottery or its signature.");
    }

    // function testIncreaseAndGetEscrow() public {
    //      Lottery instance = Lottery(DeployedAddresses.Lottery());
         
    // }
}