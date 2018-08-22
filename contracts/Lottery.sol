pragma solidity ^0.4.24;

contract Lottery
{
    struct Escrow {
        uint deposite;
    }

    mapping(address => Escrow) accounts;
    uint8 power = 18;
    uint32 faceValue = 1E8; // unit is wei

    /// Get escrow by account address
    function getEscrow(address account) public view returns (uint deposite)
    {
        Escrow storage esc = accounts[account];
        deposite = esc.deposite;
    }

    /// Increase the deposite of the escrow account
    function increase() public payable {
        Escrow storage esc = accounts[msg.sender];
        esc.deposite += msg.value;
    }

    function verify(bytes lottery, bytes signature) public returns (bool success, string err) {
        address addr = verifySig(signature, lottery);
        if (addr == 0x00) {
            success = false;
            err = "invalid signature of the lottery";
            return (success, err);
        }

        (bytes1 ver, bytes memory rs1, bytes memory rs2, bytes32 hashRs1, address dest) = splitLottery(lottery); 
        if (dest == 0x00) {
            dest = msg.sender;
        }

        require(hashRs1 == sha256(rs1), "Hash of the random string 1 does not match.");
        if (verifyLottery(uint8(ver), rs1, rs2, hashRs1)) {
            Escrow storage esc = accounts[addr];
            esc.deposite -= faceValue;
            dest.transfer(faceValue);
        }
    }

    /// Verify if a lottery wins and tranfer its face value to the winner
    function verifyLottery(uint8 ver, bytes rs1, bytes rs2, bytes32 hashRS1) public view returns (bool)
    {
        require(ver == 0, "Version must be 0");
        require(sha256(rs1) == hashRS1, "The random string 1 or its hash supplied is incorrect.");
        bytes memory rs1Rs2 = new bytes(rs1.length + rs2.length);
        for (uint8 i = 0; i < rs1.length; i++) {
            rs1Rs2[i] = rs1[i];
        }
        uint8 offset = uint8(rs1.length);
        for ( i = 0; i < rs2.length; i++) {
            rs1Rs2[i + offset] = rs2[i];
        }

        bytes32 hashRs1Rs2 = sha256(rs1Rs2);
        bytes32 hashRs2 = sha256(rs2);

        return verifyXOR(hashRs1Rs2, hashRs2, power);
    }

    function verifyXOR(bytes32 hRs1Rs2, bytes32 hRs2, uint8 n) internal pure returns (bool ret)
    {
        require(n <= 64, "The probability parameter should not be greater than 0.");
        bytes32 xor = hRs1Rs2 ^ hRs2;
        ret = true;
        uint8 maxByte = n / 8;
        uint8 mod = n % 8;
        for (uint8 i = 0; i < maxByte; i++) {
            bytes1 b = xor[i];
            if (uint8(b) != 0) {
                ret = false;
                break;
            }
        }
        if (ret && mod != 0) {
            ret = uint8(xor[maxByte] << (8 - mod)) == 0;
        }
    }

    function verifySig(bytes memory signature, bytes memory lottery) internal pure returns (address addr) {
        bytes32 prefixedHashed = prefixed(keccak256(lottery));
        addr = recoverSigner(prefixedHashed, signature);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 message) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65, "sigature should always be 65 bytes long.");

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function splitLottery(bytes memory lottery) internal pure 
    returns (bytes1 ver, bytes rs1, bytes rs2, bytes32 hashRs1, address addr)
    {
        ver = lottery[0];
        require(ver == 0, "Only version 0 is supported.");
       
        uint8 len1 = uint8(lottery[1]);
        uint8 len2 = uint8(lottery[2]);
        rs1 = new bytes(len1);
        rs2 = new bytes(len2);
        for (uint8 i = 0; i < len1; i++) {
            rs1[i] = lottery[i + 3];
        }
        
        for (i = 0; i < len2; i++) {
            rs2[i] = lottery[i + len1 + 3];
        }
        uint8 offset = len1 + len2 + 3;
        assembly {
           hashRs1 := mload(add(lottery, add(32, offset)))
           offset := add(offset, 52)
           addr := mload(add(lottery, offset))
        }
    }


    /// Store the stub of the winning lottery

    /// Check if the winning lottery has been redeemed once.
}
