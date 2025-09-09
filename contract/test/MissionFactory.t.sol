// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Test.sol";
import "../src/MissionFactory.sol";
import "../src/MockYieldStrategy.sol";
import "../src/RewardDistributor.sol";

contract MissionFactoryTest is Test {
    MissionFactory missionFactory;
    MockYieldStrategy yieldStrategy;
    RewardDistributor rewardDistributor;

    address owner = address(1);
    address asset = address(2);
    address treasury = address(3);

    uint256 targetAmount = 1000;
    uint256 cadence = 86400; // 1 day
    uint256 duration = 2592000; // 30 days

    function setUp() public {
        yieldStrategy = new MockYieldStrategy(asset);
        rewardDistributor = new RewardDistributor(treasury, 500); // 5% fee
        missionFactory = new MissionFactory(owner);
    }

    function testCreateMission() public {
        vm.prank(owner);
        address missionPool = missionFactory.createMission(
            asset,
            targetAmount,
            cadence,
            duration,
            address(yieldStrategy),
            address(rewardDistributor)
        );

        assertTrue(missionPool != address(0));
        address[] memory pools = missionFactory.getMissionPools();
        assertEq(pools.length, 1);
        assertEq(pools[0], missionPool);
    }

    function testCreateMissionOnlyOwner() public {
        vm.prank(address(4));
        vm.expectRevert();
        missionFactory.createMission(
            asset,
            targetAmount,
            cadence,
            duration,
            address(yieldStrategy),
            address(rewardDistributor)
        );
    }

    function testGetMissionPools() public {
        vm.startPrank(owner);

        missionFactory.createMission(
            asset,
            targetAmount,
            cadence,
            duration,
            address(yieldStrategy),
            address(rewardDistributor)
        );

        missionFactory.createMission(
            asset,
            targetAmount * 2,
            cadence,
            duration,
            address(yieldStrategy),
            address(rewardDistributor)
        );

        vm.stopPrank();

        address[] memory pools = missionFactory.getMissionPools();
        assertEq(pools.length, 2);
    }

    function testOwnership() public {
        assertEq(missionFactory.owner(), owner);

        vm.prank(owner);
        missionFactory.transferOwnership(address(4));
        assertEq(missionFactory.owner(), address(4));
    }
}
