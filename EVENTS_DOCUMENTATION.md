# Social Savings Missions - Contract Events Documentation

This document outlines all events emitted by the Social Savings Missions smart contracts for analytics and data analysis purposes.

## Overview

All contracts emit rich, indexed events that capture key user actions, state changes, and business metrics. These events are designed to be easily queried and analyzed for dashboard creation and KPI tracking.

## 1. IdentityBinder Contract Events

### AddressBound
**Purpose**: Tracks when a LINE user ID is bound to an EVM address
**Use Cases**: User acquisition tracking, anti-sybil analysis, social graph analysis

```solidity
event AddressBound(bytes32 indexed lineIdHash, address indexed userAddress, uint256 timestamp);
```

**Fields**:
- `lineIdHash` (indexed): Hashed LINE user ID for privacy
- `userAddress` (indexed): EVM address of the user
- `timestamp`: When the binding occurred

**Analytics Applications**:
- Daily/weekly new user registrations
- User retention analysis
- Sybil attack detection patterns

## 2. MissionFactory Contract Events

### MissionCreated
**Purpose**: Tracks when new savings missions are created
**Use Cases**: Mission creation analytics, creator activity tracking

```solidity
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
```

**Fields**:
- `missionPool` (indexed): Address of the created mission pool contract
- `creator` (indexed): Address of the mission creator
- `targetAmount`: Total amount to save (in wei)
- `cadence`: Time between deposits (seconds)
- `duration`: Total mission duration (seconds)
- `asset`: Token address for the mission
- `yieldStrategy`: Address of the yield strategy contract
- `rewardDistributor`: Address of the reward distributor contract
- `timestamp`: When the mission was created

**Analytics Applications**:
- Mission creation trends
- Popular mission parameters
- Creator activity metrics

## 3. MissionPool Contract Events

### UserJoined
**Purpose**: Tracks when users join a mission
**Use Cases**: User engagement, mission popularity analysis

```solidity
event UserJoined(address indexed user, uint256 timestamp);
```

**Fields**:
- `user` (indexed): Address of the user who joined
- `timestamp`: When the user joined

### Deposit
**Purpose**: Tracks individual deposit transactions
**Use Cases**: Deposit frequency, user activity patterns, savings velocity

```solidity
event Deposit(address indexed user, uint256 amount, uint256 newStreak, uint256 totalDeposited, uint256 timestamp);
```

**Fields**:
- `user` (indexed): Address of the depositing user
- `amount`: Deposit amount (in wei)
- `newStreak`: User's current streak count
- `totalDeposited`: User's total deposited amount
- `timestamp`: When the deposit occurred

**Analytics Applications**:
- Daily/weekly deposit volumes
- User streak distributions
- Deposit timing patterns

### MissedDeposit
**Purpose**: Tracks when users miss deposit windows
**Use Cases**: User engagement analysis, streak break patterns

```solidity
event MissedDeposit(address indexed user, uint256 previousStreak, uint256 timestamp);
```

**Fields**:
- `user` (indexed): Address of the user who missed
- `previousStreak`: Streak count before missing
- `timestamp`: When the miss occurred

### MissionCompleted
**Purpose**: Tracks successful mission completions
**Use Cases**: Success rate analysis, user achievement tracking

```solidity
event MissionCompleted(address indexed user, uint256 totalDeposited, uint256 finalStreak, uint256 timestamp);
```

**Fields**:
- `user` (indexed): Address of the completing user
- `totalDeposited`: Final total deposited amount
- `finalStreak`: Final streak count
- `timestamp`: When the mission was completed

### Withdrawal
**Purpose**: Tracks fund withdrawals after mission completion
**Use Cases**: Withdrawal patterns, fund flow analysis

```solidity
event Withdrawal(address indexed user, uint256 amount, uint256 remainingBalance, uint256 timestamp);
```

**Fields**:
- `user` (indexed): Address of the withdrawing user
- `amount`: Withdrawal amount (in wei)
- `remainingBalance`: Remaining balance after withdrawal
- `timestamp`: When the withdrawal occurred

## 4. RewardDistributor Contract Events

### RewardSettled
**Purpose**: Tracks reward distributions to users
**Use Cases**: Reward distribution analysis, yield tracking

```solidity
event RewardSettled(address indexed missionPool, address indexed user, uint256 baseReward, uint256 bonusReward, uint256 totalReward, uint256 timestamp);
```

**Fields**:
- `missionPool` (indexed): Mission pool address
- `user` (indexed): Address of the rewarded user
- `baseReward`: Base reward amount (in wei)
- `bonusReward`: Bonus reward amount (in wei)
- `totalReward`: Total reward amount (in wei)
- `timestamp`: When the reward was settled

### TreasuryFee
**Purpose**: Tracks platform fees collected
**Use Cases**: Revenue tracking, fee analysis

```solidity
event TreasuryFee(address indexed missionPool, uint256 amount, uint256 timestamp);
```

**Fields**:
- `missionPool` (indexed): Mission pool address
- `amount`: Fee amount collected (in wei)
- `timestamp`: When the fee was collected

### MissionSettled
**Purpose**: Tracks mission settlement events
**Use Cases**: Mission lifecycle analysis, yield performance

```solidity
event MissionSettled(address indexed missionPool, uint256 totalParticipants, uint256 totalDeposited, uint256 totalYield, uint256 timestamp);
```

**Fields**:
- `missionPool` (indexed): Mission pool address
- `totalParticipants`: Number of participants
- `totalDeposited`: Total amount deposited (in wei)
- `totalYield`: Total yield generated (in wei)
- `timestamp`: When the mission was settled

### SquadBonusDistributed
**Purpose**: Tracks squad bonus distributions
**Use Cases**: Social feature engagement, bonus distribution analysis

```solidity
event SquadBonusDistributed(address indexed missionPool, address indexed user, uint256 bonusAmount, uint256 squadSize, uint256 timestamp);
```

**Fields**:
- `missionPool` (indexed): Mission pool address
- `user` (indexed): Address of the user receiving bonus
- `bonusAmount`: Bonus amount distributed (in wei)
- `squadSize`: Size of the squad
- `timestamp`: When the bonus was distributed

## Key Performance Indicators (KPIs)

Using these events, you can calculate the following KPIs:

### Growth & Adoption
- **Total Value Locked (TVL)**: Sum of all deposits across active missions
- **Number of Active Missions**: Count of MissionCreated events minus completed missions
- **New Users**: Count of AddressBound events over time
- **Number of Squads Formed**: Derived from squad-related events

### User Engagement & Retention
- **Mission Completion Rate**: MissionCompleted / (MissionCreated × average participants)
- **Average Deposit Amount**: Average of Deposit.amount values
- **D1/D7/D30 Retention**: User activity patterns over time
- **Average Streak Length**: Average of finalStreak from MissionCompleted events
- **Distribution of Squad Sizes**: From SquadBonusDistributed.squadSize

### Social & Virality
- **Referral Tree Depth & Breadth**: Track user invitation chains
- **Chat-Triggered Actions**: LINE webhook events (external to contracts)

## CSV Export Format

The analytics export script generates a CSV with the following columns:

```csv
Event Type,Contract Address,Mission Pool,User,Line ID Hash,User Address,Creator,Target Amount,Cadence (seconds),Duration (seconds),Asset Address,Yield Strategy,Reward Distributor,Amount,New Streak,Total Deposited,Previous Streak,Final Streak,Remaining Balance,Base Reward,Bonus Reward,Total Reward,Total Participants,Total Deposited,Total Yield,Timestamp,Block Number,Transaction Hash
```

## Dune Analytics Integration

### Direct Integration (if supported)
If Dune supports Kaia network directly:
1. Connect your wallet to Dune
2. Create queries using the contract addresses
3. Use the event signatures above to decode logs

### CSV Upload Fallback
1. Run `npm run export:csv` in the backend directory
2. Upload the generated `social_savings_analytics.csv` to Dune
3. Create datasets and dashboards from the uploaded data

## Query Examples

### Daily Active Users
```sql
SELECT
  DATE(timestamp) as date,
  COUNT(DISTINCT user) as dau
FROM deposits
GROUP BY DATE(timestamp)
ORDER BY date DESC
```

### Mission Success Rate
```sql
SELECT
  mission_pool,
  COUNT(DISTINCT user) as participants,
  COUNT(CASE WHEN event_type = 'MissionCompleted' THEN 1 END) as completions,
  ROUND(completions * 100.0 / participants, 2) as success_rate
FROM mission_events
GROUP BY mission_pool
```

### TVL Over Time
```sql
SELECT
  DATE(timestamp) as date,
  SUM(amount) OVER (ORDER BY timestamp) as tvl
FROM deposits
ORDER BY date
```

This comprehensive event system provides all the data needed to build detailed analytics dashboards and track the success of the Social Savings Missions protocol.
