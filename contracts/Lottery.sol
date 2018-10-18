pragma solidity 0.4.24;

import "./FileToken.sol";


contract Lottery {
    uint256 constant private MAX_UINT256 = 2**256 - 1;
    uint16 constant private MIN_FINE = 1000;

    event RedeemingLottery(bytes lottery, bytes sig, bytes winningData, address sender);
    event RedeemedLotttery(bytes lottery, uint64 issuingTime, uint256 faceValue, address issuer, address winner);

    struct Escrow {
        uint deposite;
        bool unLocked; // when locked the owner cannot withdraw his/her deposite.
    }
    
    struct Stub {
        bool stored;
        bytes32 h1;// hash of random string1
        bytes32 h2;// hash of random string1 + random string2
    }

    FileToken public fileToken;
    //address private adminAddr;
    address private creator;
    mapping(address => Escrow) private accounts;
    mapping(address => Stub[10]) private stubsMapping; // lottery issuer to lottery stub
    mapping(address => uint8) private stubsIndex; // each index store where the stub is stored
    
    uint8 private power  = 18;
    uint256 private faceValue = 10 finney; // unit is finney
    uint256 private minimalEscrow = 100 finney;

    modifier admin {
        require(msg.sender == creator, "Only administrator, aka the contract creator, can call this method");
        _;
    }

    constructor() public {
        creator = msg.sender;
        fileToken = new FileToken(2**256 - 1, "FileToken", 0, "Ft", address(this), creator);
    }

   /* transfer tokens from this contract to the user account */
    function increase(address to, uint256 amount) public returns (bool success) {
        require(msg.sender == creator, "Only admin can call this method");
        fileToken.transfer(to, amount);
        success = true;
    }

    /* redeem lottery */
    function redeemLottery(bytes lottery, bytes signature, bytes winningData) public returns (bool success){
        emit RedeemingLottery(lottery, signature, winningData, msg.sender);
        require(fileToken.getPledge(msg.sender) > MIN_FINE, "The pledge of the msg.sender calling redeem should have pledge.");
        address issuer = verifySig(signature, lottery);
        require(issuer != 0x00, "Signature verification failed");
        (bytes1 ver, bytes memory rs2, bytes32 hashRs1, address dest, uint64 time) = splitLottery(lottery); 
        if (dest == 0x00) {
            dest = msg.sender;
        }

        // bytes32 hrs2 = getHash(rs2);
        bytes32 hashRs1Rs2 = constructHashRs1Rs2(winningData, rs2);
        bool found = checkStubs(hashRs1, hashRs1Rs2, issuer); //prevent replay attack
        require(!found, "The lottery has been redeemed.");
       
        require(verifyRs1Hash(winningData, hashRs1), "Hash of the random string 1 does not match.");
       
        if (verifyWinningLottery(uint8(ver), hashRs1Rs2, rs2)) {
            success = transfer(issuer, dest);
            if (success) {
                storeStub(issuer, hashRs1, hashRs1Rs2);
                emit RedeemedLotttery(lottery, time, faceValue, issuer, dest);
            }
        } else {
            success = false;
        }
    }

    function transfer(address source, address dest) private returns (bool success){
        success = fileToken.transferFrom(source, dest, faceValue);
    }
    
    function verifySig(bytes memory signature, bytes memory lottery) public pure returns (address addr) {
        bytes32 prefixedHashed = prefixed(keccak256(lottery));
        addr = recoverSigner(prefixedHashed, signature);
    }
    
    function verifyRs1Hash(bytes rs1, bytes32 hashRs1) internal pure returns (bool eq) {
        eq = false;
        bytes32 actual = getHash(rs1);
        eq = (hashRs1 == actual);
    }
    
    function getHash(bytes data) internal pure returns (bytes32 h) {
        h = keccak256(data);
    }

    /// Verify if a lottery wins and tranfer its face value to the winner
    function verifyWinningLottery(uint8 ver, bytes32 hashRs1Rs2, bytes rs2) internal view returns (bool)
    {
        require(ver == 0, "Version must be 0");
        bytes32 hashRs2 = getHash(rs2);

        return verifyXOR(hashRs1Rs2, hashRs2, power);
    }

    function checkStubs(bytes32 hashRs1, bytes32 hashRs1Rs2, address addr) internal view returns (bool found){
        Stub[10] storage stubs = stubsMapping[addr];
  
        bool foundEmpty = false;
        found = false;
        for (uint8 i = 0; i < stubs.length; i++) {
            Stub storage stub = stubs[i];
            if (!stub.stored) {
                foundEmpty = true; 
                //stubIndex = i;
                break;
            }
            found = stub.h1 == hashRs1 && stub.h2 == hashRs1Rs2;
            if (found) {
                break;
            }
        }
    }
    
    function storeStub(address issuer, bytes32 hashRs1, bytes32 hashRs1Rs2) internal  {
        uint8 stubIndex = stubsIndex[issuer];
        Stub storage stub = stubsMapping[issuer][stubIndex];
        stub.stored = true;
        stub.h1 = hashRs1;
        stub.h2 = hashRs1Rs2;
        stubIndex = (stubIndex + 1) % 10;
        stubsIndex[issuer] = stubIndex;
    }
    
    function constructHashRs1Rs2(bytes rs1, bytes rs2) internal pure returns (bytes32 hashRs1Rs2)
    {
        bytes memory rs1Rs2 = new bytes(rs1.length + rs2.length);
        for (uint8 i = 0; i < rs1.length; i++) {
            rs1Rs2[i] = rs1[i];
        }
        uint8 offset = uint8(rs1.length);
        for (i = 0; i < rs2.length; i++) {
            rs1Rs2[i + offset] = rs2[i];
        }
        hashRs1Rs2 = getHash(rs1Rs2);
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

    function splitLottery(bytes memory lottery) public pure 
    returns (bytes1 ver, bytes rs2, bytes32 hashRs1, address addr, uint64 time)
    {
        ver = lottery[0];
        require(ver == 0, "Only version 0 is supported.");
       
        uint8 len1 = uint8(lottery[1]); // len of rs2
        rs2 = new bytes(len1);
        for (uint8 i = 0; i < len1; i++) {
            rs2[i] = lottery[i + 2];
        }

        uint8 offset = len1 + 2;
        assembly {
           hashRs1 := mload(add(lottery, add(32, offset)))
           offset := add(offset, 52)
           addr := mload(add(lottery, offset))
           offset := add(offset, 8)
           time := mload(add(lottery, offset))
        }        
    }

    /// If the escrow is locked, withdraw will fail.
    /// To unlock the account, it requires the admin account to call the "unlock" method.
    /// The user cannot withdraw all escrowed money using this method; the minimal left
    /// is 100 finey.
    /// To withdraw all money, it requires the admin account to call the "withdrawAll" method.
    function withdraw(uint amount) public returns (bool success) {
        Escrow storage esc = accounts[msg.sender];
        if (esc.unLocked) {
            uint a = amount;
            if (amount > esc.deposite - minimalEscrow) {
                a = esc.deposite - minimalEscrow;
            }
            esc.deposite -= a;
            msg.sender.transfer(a);
            success = true;
        }
    }

    function withdrawAll(address addr) public admin {
        Escrow storage esc = accounts[addr];
        if (esc.deposite > 0) {
            addr.transfer(esc.deposite);
        }
    }

    function unLock(address addr) public admin {
        Escrow storage esc = accounts[addr];
        esc.unLocked = true;
    }

    function lock(address addr) public admin {
        Escrow storage esc = accounts[addr];
        esc.unLocked = true;
    }
    
}
