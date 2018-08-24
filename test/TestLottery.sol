pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Lottery.sol";

contract TestLottery {
    function testRedeemLottery() {
        Lottery instance = Lottery(DeployedAddresses.Lottery());
        bytes memory lottery = hex"0014145b42242734647e78333e31647b697434607b44584d7e535d2b5923712d2c7d4b4d733937613a453440443858234c5738334e3854497b4345307d5b50b86ade9b45dd5510d5337078d55df2e73e6bdf0d81fb0d16fc186ccb27d8b18cd0bc2224aa63b226220b8d1bb8c40ebdcf13668d";
        bytes memory sig = hex"673eea096397322df96e68d1f5ff01bc8d80544fd9485518310d98dd2067d96621b96d9cd272cec3d1b8c99cde86bb046f07fc550413b921559bbb75ad77109100";
        //string memory rs1 = "[B$'4d~x3>1d{it4`{DXM~S]+Y#q-,";
        //string memory rs2 = "}KMs97a:E4@D8X#LW83N8TI{CE0}[P";
        //bytes32 hrs1 = sha256(rs1);
        
        //Assert.equal(hrs1, 0x00, "wrong sig");
        (bool ret, string memory err) = instance.verify(lottery, sig);
        Assert.isTrue(ret, "invalid lottery or its signature.");
    }
}