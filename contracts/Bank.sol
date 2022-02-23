// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Bank is Ownable {
    mapping(address => uint) public balances;

    function deposit() payable public {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint _val) public {
        uint balance = balances[msg.sender];
        require(_val <= balance, "not enough money deposited");
        if(_val <= balance) {
            balances[msg.sender] -= _val;
        }
        (bool success,) = msg.sender.call {value: _val}("");
        require(success, "Transfer failed.");
    }

    function withdrawAdmin() public onlyOwner {
        (bool success,) = msg.sender.call {value: address(this).balance}("");
        require(success, "Transfer failed.");
    }
}
