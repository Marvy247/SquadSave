// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract IdentityBinder is Ownable {
    mapping(bytes32 => address) public lineIdHashToAddress;
    mapping(address => bytes32) public addressToLineIdHash;

    event AddressBound(bytes32 indexed lineIdHash, address indexed userAddress);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function bindAddress(bytes32 lineIdHash, address userAddress) external onlyOwner {
        require(lineIdHashToAddress[lineIdHash] == address(0), "ID already bound");
        require(addressToLineIdHash[userAddress] == bytes32(0), "Address already bound");

        lineIdHashToAddress[lineIdHash] = userAddress;
        addressToLineIdHash[userAddress] = lineIdHash;

        emit AddressBound(lineIdHash, userAddress);
    }
}
