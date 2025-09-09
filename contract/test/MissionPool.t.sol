// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../src/MissionPool.sol";
import "../src/MockYieldStrategy.sol";
import "../src/RewardDistributor.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract MissionPoolTest is Test {
    MissionPool missionPool;
    MockERC20 asset;
    MockYieldStrategy yieldStrategy;
    RewardDistributor rewardDistributor;

    address creator = address(1);
    address user1 = address(2);
    address user2 = address(3);
    address treasury = address(4);

    uint256 targetAmount = 1000 * 10**18;
    uint256 cadence = 86400; // 1 day
    uint256 duration = 2592000; // 30 days

    function setUp() public {
        asset = new MockERC20();
        yieldStrategy = new MockYieldStrategy(address(asset));
        rewardDistributor = new RewardDistributor(treasury, 500); // 5% fee

        missionPool = new MissionPool(
            address(asset),
            targetAmount,
            cadence,
            duration,
            creator,
            address(yieldStrategy),
            address(rewardDistributor)
        );

        // Transfer tokens to users
        asset.transfer(user1, 10000 * 10**18);
        asset.transfer(user2, 10000 * 10**18);
    }

    function testConstructor() public {
        assertEq(address(missionPool.asset()), address(asset));
        assertEq(missionPool.targetAmount(), targetAmount);
        assertEq(missionPool.cadence(), cadence);
        assertEq(missionPool.duration(), duration);
        assertEq(missionPool.creator(), creator);
    }

    function testDeposit() public {
        vm.startPrank(user1);

        // Approve tokens
        asset.approve(address(missionPool), targetAmount);

        // Deposit
        missionPool.deposit();

        // Check user progress
        MissionPool.UserProgress memory progress = missionPool.getUserProgress(user1);
        assertEq(progress.totalDeposited, targetAmount);
        assertEq(progress.currentStreak, 1);

        vm.stopPrank();
    }

    function testDepositMultipleTimes() public {
        vm.startPrank(user1);

        // First deposit
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();

        // Wait for next cadence window
        vm.warp(block.timestamp + cadence);

        // Second deposit
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();

        // Check user progress
        MissionPool.UserProgress memory progress = missionPool.getUserProgress(user1);
        assertEq(progress.totalDeposited, targetAmount * 2);
        assertEq(progress.currentStreak, 2);

        vm.stopPrank();
    }

    function testDepositMissedWindow() public {
        vm.startPrank(user1);

        // First deposit
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();

        // Wait beyond the cadence window
        vm.warp(block.timestamp + cadence * 2);

        // Try to deposit - should reset streak
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();

        // Check user progress - streak should be reset
        MissionPool.UserProgress memory progress = missionPool.getUserProgress(user1);
        assertEq(progress.totalDeposited, targetAmount * 2);
        assertEq(progress.currentStreak, 1);

        vm.stopPrank();
    }

    function testWithdraw() public {
        vm.startPrank(user1);

        // Deposit first
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();

        uint256 initialBalance = asset.balanceOf(user1);

        // Withdraw half
        missionPool.withdraw(targetAmount / 2);

        // Check balances
        MissionPool.UserProgress memory progress = missionPool.getUserProgress(user1);
        assertEq(progress.totalDeposited, targetAmount / 2);
        assertEq(asset.balanceOf(user1), initialBalance + targetAmount / 2);

        vm.stopPrank();
    }

    function testWithdrawInsufficientBalance() public {
        vm.startPrank(user1);

        // Deposit first
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();

        // Try to withdraw more than deposited
        vm.expectRevert();
        missionPool.withdraw(targetAmount * 2);

        vm.stopPrank();
    }

    function testGetParticipants() public {
        vm.startPrank(user1);
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();
        vm.stopPrank();

        vm.startPrank(user2);
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();
        vm.stopPrank();

        address[] memory participants = missionPool.getParticipants();
        assertEq(participants.length, 2);
        assertEq(participants[0], user1);
        assertEq(participants[1], user2);
    }

    function testMissionEnded() public {
        vm.startPrank(user1);
        asset.approve(address(missionPool), targetAmount);
        missionPool.deposit();
        vm.stopPrank();

        // Fast forward past mission end
        vm.warp(block.timestamp + duration + 1);

        vm.startPrank(user1);
        asset.approve(address(missionPool), targetAmount);
        vm.expectRevert();
        missionPool.deposit();
        vm.stopPrank();
    }

    function testGetMissionDetails() public {
        (
            address _asset,
            uint256 _targetAmount,
            uint256 _cadence,
            uint256 _duration,
            uint256 _startTime,
            uint256 _endTime,
            address _yieldStrategy,
            address _rewardDistributor
        ) = missionPool.getMissionDetails();

        assertEq(_asset, address(asset));
        assertEq(_targetAmount, targetAmount);
        assertEq(_cadence, cadence);
        assertEq(_duration, duration);
        assertEq(_yieldStrategy, address(yieldStrategy));
        assertEq(_rewardDistributor, address(rewardDistributor));
    }
}
