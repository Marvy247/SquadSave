// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./IYieldStrategy.sol";

interface IRewardDistributor {
    function settleMission(address missionPoolAddress) external;
    function claimReward(address missionPoolAddress, address user) external;
}

contract MissionPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct UserProgress {
        uint256 totalDeposited;
        uint256 currentStreak;
        uint256 lastDepositTimestamp;
        uint256 nextDepositWindow;
    }

    IERC20 public asset;
    uint256 public targetAmount;
    uint256 public cadence;
    uint256 public duration;
    uint256 public startTime;
    uint256 public endTime;
    address public creator;
    IYieldStrategy public yieldStrategy;
    IRewardDistributor public rewardDistributor;

    address[] public participants;
    mapping(address => UserProgress) public userProgress;
    mapping(address => bool) public hasJoined;

    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 newStreak,
        uint256 totalDeposited,
        uint256 timestamp
    );

    event MissedDeposit(
        address indexed user,
        uint256 previousStreak,
        uint256 timestamp
    );

    event MissionCompleted(
        address indexed user,
        uint256 totalDeposited,
        uint256 finalStreak,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed user,
        uint256 amount,
        uint256 remainingBalance,
        uint256 timestamp
    );

    event UserJoined(
        address indexed user,
        uint256 timestamp
    );

    constructor(
        address _asset,
        uint256 _targetAmount,
        uint256 _cadence,
        uint256 _duration,
        address _creator,
        address _yieldStrategy,
        address _rewardDistributor
    ) Ownable(_creator) {
        asset = IERC20(_asset);
        targetAmount = _targetAmount;
        cadence = _cadence;
        duration = _duration;
        creator = _creator;
        yieldStrategy = IYieldStrategy(_yieldStrategy);
        rewardDistributor = IRewardDistributor(_rewardDistributor);
        startTime = block.timestamp;
        endTime = startTime + _duration;
    }

    function deposit() external nonReentrant {
        require(block.timestamp <= endTime, "Mission has ended");
        require(block.timestamp >= startTime, "Mission has not started");

        UserProgress storage progress = userProgress[msg.sender];

        // Check if user has joined
        if (!hasJoined[msg.sender]) {
            participants.push(msg.sender);
            hasJoined[msg.sender] = true;
            emit UserJoined(msg.sender, block.timestamp);
        }

        // Check if deposit is within cadence window
        if (progress.nextDepositWindow > 0) {
            require(block.timestamp <= progress.nextDepositWindow, "Deposit window missed");

            // Check if previous deposit was missed
            if (block.timestamp > progress.nextDepositWindow - cadence) {
                // Reset streak if deposit was missed
                emit MissedDeposit(msg.sender, progress.currentStreak, block.timestamp);
                progress.currentStreak = 0;
            }
        }

        // Transfer tokens from user
        asset.safeTransferFrom(msg.sender, address(this), targetAmount);

        // Update user progress
        progress.totalDeposited += targetAmount;
        progress.currentStreak += 1;
        progress.lastDepositTimestamp = block.timestamp;
        progress.nextDepositWindow = block.timestamp + cadence;

        // Deposit to yield strategy
        asset.approve(address(yieldStrategy), targetAmount);
        yieldStrategy.deposit(targetAmount);

        emit Deposit(
            msg.sender,
            targetAmount,
            progress.currentStreak,
            progress.totalDeposited,
            block.timestamp
        );

        // Check if mission is completed
        if (progress.totalDeposited >= targetAmount * (duration / cadence)) {
            emit MissionCompleted(
                msg.sender,
                progress.totalDeposited,
                progress.currentStreak,
                block.timestamp
            );
        }
    }

    function withdraw(uint256 amount) external nonReentrant {
        UserProgress storage progress = userProgress[msg.sender];
        require(progress.totalDeposited >= amount, "Insufficient balance");

        // Withdraw from yield strategy first
        yieldStrategy.withdraw(amount);

        // Update user progress
        progress.totalDeposited -= amount;

        // Transfer tokens to user
        asset.safeTransfer(msg.sender, amount);

        emit Withdrawal(
            msg.sender,
            amount,
            progress.totalDeposited,
            block.timestamp
        );
    }

    function getMissionDetails() external view returns (
        address _asset,
        uint256 _targetAmount,
        uint256 _cadence,
        uint256 _duration,
        uint256 _startTime,
        uint256 _endTime,
        address _yieldStrategy,
        address _rewardDistributor
    ) {
        return (
            address(asset),
            targetAmount,
            cadence,
            duration,
            startTime,
            endTime,
            address(yieldStrategy),
            address(rewardDistributor)
        );
    }

    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    function getUserProgress(address _user) external view returns (UserProgress memory) {
        return userProgress[_user];
    }

    function depositAmount() external pure returns (uint256) {
        return 0; // This would be calculated based on mission parameters
    }
}
