pragma solidity 0.4.24;

import "./EIP20.sol";

contract FileToken is EIP20 {
    address private lotteryAddr;
    address public adminAddr;
    mapping(address => uint256) private pledgeAccounts;
    constructor(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
		address _lotteryAddr,
		address _origCreator
    ) EIP20(_initialAmount, _tokenName, _decimalUnits, _tokenSymbol) public {
        lotteryAddr = _lotteryAddr;
        adminAddr = _origCreator;
    }

    /** The lottery receiver (file sender) needs to call this before getting any services.
        Under the hood, the tokens are transfered to the system admin account.
    */
    function turnInPledge(uint256 amount) public returns (bool success){
        uint256 f = pledgeAccounts[msg.sender];
        success = transfer(adminAddr, amount);
        if (!success) return;
        pledgeAccounts[msg.sender] = f + amount;
        success = true;
    }

    /** The system admin will call this method to return the fine to its owner.*/
    function returnPledge(address to) public {
        require(msg.sender == adminAddr, "Only admin can call it");
        pledgeAccounts[to] = 0;
        transfer(to, pledgeAccounts[to]);
    }

    function getPledge(address owner) public view returns (uint256) {
        return pledgeAccounts[owner];
    }
}