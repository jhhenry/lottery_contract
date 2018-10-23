pragma solidity ^0.4.24;

import "./EIP20.sol";

contract AbstractFileToken is EIP20 {
     /** The lottery receiver (file sender) needs to call this before getting any services.
        Under the hood, the tokens are transfered to the system admin account.
    */
    function turnInPledge(uint256 amount) public returns (bool success);

    /** The system admin will call this method to return the fine to its owner.*/
    function returnPledge(address to) public;

    function getPledge(address owner) public view returns (uint256);
}