// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "./MissionPool.sol";

interface IMissionPool {
    // Interface for MissionPool constructor parameters if needed
}

contract MissionFactory is Ownable {
    address[] public missionPools;

    event MissionCreated(
        address indexed missionPool,
        address indexed creator,
        uint256 targetAmount,
        uint256 cadence,
        uint256 duration,
        address asset,
        address yieldStrategy,
        address rewardDistributor,
        uint256 timestamp
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createMission(
        address _asset,
        uint256 _targetAmount,
        uint256 _cadence,
        uint256 _duration,
        address _yieldStrategy,
        address _rewardDistributor
    ) external onlyOwner returns (address) {
        // Deploy new MissionPool contract
        MissionPool newMission = new MissionPool(
            _asset,
            _targetAmount,
            _cadence,
            _duration,
            msg.sender,
            _yieldStrategy,
            _rewardDistributor
        );

        missionPools.push(address(newMission));

        emit MissionCreated(
            address(newMission),
            msg.sender,
            _targetAmount,
            _cadence,
            _duration,
            _asset,
            _yieldStrategy,
            _rewardDistributor,
            block.timestamp
        );

        return address(newMission);
    }

    function getMissionPools() external view returns (address[] memory) {
        return missionPools;
    }
}
