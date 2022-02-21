// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

contract Bank {
    event Debug(uint256 val);
    address public owner;

    mapping(address => uint) public balances;

    function setOwner(address _newOwner) public {
        require(owner == address(0), "the contract has an owner already");
        owner = _newOwner;
    }

    function deposit() payable public {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint _val) public {
        uint balance = balances[msg.sender];
        require(_val <= balance || msg.sender == owner, "not enough money deposited");
        if(_val <= balance) {
            balances[msg.sender] -= _val;
        }
        (bool success,) = msg.sender.call {value: _val}("");
        require(success, "Transfer failed.");
    }
}
