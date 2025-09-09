#!/usr/bin/env node

const { ethers } = require('ethers');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Configuration
const RPC_URL = process.env.KAIA_TESTNET_RPC_URL || 'https://public-en-baobab.klaytn.net';
const CONTRACT_ADDRESSES = {
  identityBinder: process.env.IDENTITY_BINDER_ADDRESS,
  missionFactory: process.env.MISSION_FACTORY_ADDRESS,
  rewardDistributor: process.env.REWARD_DISTRIBUTOR_ADDRESS
};

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Contract ABIs (simplified for events)
const IDENTITY_BINDER_ABI = [
  "event AddressBound(bytes32 indexed lineIdHash, address indexed userAddress, uint256 timestamp)"
];

const MISSION_FACTORY_ABI = [
  "event MissionCreated(address indexed missionPool, address indexed creator, uint256 targetAmount, uint256 cadence, uint256 duration, address asset, address yieldStrategy, address rewardDistributor, uint256 timestamp)"
];

const MISSION_POOL_ABI = [
  "event Deposit(address indexed user, uint256 amount, uint256 newStreak, uint256 totalDeposited, uint256 timestamp)",
  "event MissedDeposit(address indexed user, uint256 previousStreak, uint256 timestamp)",
  "event MissionCompleted(address indexed user, uint256 totalDeposited, uint256 finalStreak, uint256 timestamp)",
  "event Withdrawal(address indexed user, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
  "event UserJoined(address indexed user, uint256 timestamp)"
];

const REWARD_DISTRIBUTOR_ABI = [
  "event RewardSettled(address indexed missionPool, address indexed user, uint256 baseReward, uint256 bonusReward, uint256 totalReward, uint256 timestamp)",
  "event TreasuryFee(address indexed missionPool, uint256 amount, uint256 timestamp)",
  "event MissionSettled(address indexed missionPool, uint256 totalParticipants, uint256 totalDeposited, uint256 totalYield, uint256 timestamp)"
];

async function exportIdentityBinderEvents() {
  if (!CONTRACT_ADDRESSES.identityBinder) {
    console.log('IdentityBinder address not configured, skipping...');
    return [];
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESSES.identityBinder, IDENTITY_BINDER_ABI, provider);

  console.log('Fetching IdentityBinder events...');
  const events = await contract.queryFilter('AddressBound', 0, 'latest');

  return events.map(event => ({
    event_type: 'AddressBound',
    contract_address: CONTRACT_ADDRESSES.identityBinder,
    line_id_hash: event.args.lineIdHash,
    user_address: event.args.userAddress,
    timestamp: new Date(Number(event.args.timestamp) * 1000).toISOString(),
    block_number: event.blockNumber,
    transaction_hash: event.transactionHash
  }));
}

async function exportMissionFactoryEvents() {
  if (!CONTRACT_ADDRESSES.missionFactory) {
    console.log('MissionFactory address not configured, skipping...');
    return [];
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESSES.missionFactory, MISSION_FACTORY_ABI, provider);

  console.log('Fetching MissionFactory events...');
  const events = await contract.queryFilter('MissionCreated', 0, 'latest');

  return events.map(event => ({
    event_type: 'MissionCreated',
    contract_address: CONTRACT_ADDRESSES.missionFactory,
    mission_pool: event.args.missionPool,
    creator: event.args.creator,
    target_amount: ethers.formatEther(event.args.targetAmount),
    cadence_seconds: event.args.cadence.toString(),
    duration_seconds: event.args.duration.toString(),
    asset_address: event.args.asset,
    yield_strategy: event.args.yieldStrategy,
    reward_distributor: event.args.rewardDistributor,
    timestamp: new Date(Number(event.args.timestamp) * 1000).toISOString(),
    block_number: event.blockNumber,
    transaction_hash: event.transactionHash
  }));
}

async function exportMissionPoolEvents() {
  if (!CONTRACT_ADDRESSES.missionFactory) {
    console.log('MissionFactory address not configured, cannot fetch mission pools...');
    return [];
  }

  const factoryContract = new ethers.Contract(CONTRACT_ADDRESSES.missionFactory, [
    "function getMissionPools() view returns (address[])"
  ], provider);

  console.log('Fetching mission pool addresses...');
  const missionPools = await factoryContract.getMissionPools();

  const allEvents = [];

  for (const poolAddress of missionPools) {
    console.log(`Fetching events for mission pool: ${poolAddress}`);
    const contract = new ethers.Contract(poolAddress, MISSION_POOL_ABI, provider);

    const eventTypes = ['Deposit', 'MissedDeposit', 'MissionCompleted', 'Withdrawal', 'UserJoined'];

    for (const eventType of eventTypes) {
      try {
        const events = await contract.queryFilter(eventType, 0, 'latest');
        const formattedEvents = events.map(event => {
          const baseData = {
            event_type: eventType,
            contract_address: poolAddress,
            user: event.args.user,
            timestamp: new Date(Number(event.args.timestamp || event.args[4]) * 1000).toISOString(),
            block_number: event.blockNumber,
            transaction_hash: event.transactionHash
          };

          // Add event-specific fields
          switch (eventType) {
            case 'Deposit':
              return {
                ...baseData,
                amount: ethers.formatEther(event.args.amount),
                new_streak: event.args.newStreak.toString(),
                total_deposited: ethers.formatEther(event.args.totalDeposited)
              };
            case 'MissedDeposit':
              return {
                ...baseData,
                previous_streak: event.args.previousStreak.toString()
              };
            case 'MissionCompleted':
              return {
                ...baseData,
                total_deposited: ethers.formatEther(event.args.totalDeposited),
                final_streak: event.args.finalStreak.toString()
              };
            case 'Withdrawal':
              return {
                ...baseData,
                amount: ethers.formatEther(event.args.amount),
                remaining_balance: ethers.formatEther(event.args.remainingBalance)
              };
            case 'UserJoined':
              return baseData;
            default:
              return baseData;
          }
        });

        allEvents.push(...formattedEvents);
      } catch (error) {
        console.log(`Error fetching ${eventType} events for ${poolAddress}:`, error.message);
      }
    }
  }

  return allEvents;
}

async function exportRewardDistributorEvents() {
  if (!CONTRACT_ADDRESSES.rewardDistributor) {
    console.log('RewardDistributor address not configured, skipping...');
    return [];
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESSES.rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);

  console.log('Fetching RewardDistributor events...');
  const allEvents = [];

  const eventTypes = ['RewardSettled', 'TreasuryFee', 'MissionSettled'];

  for (const eventType of eventTypes) {
    try {
      const events = await contract.queryFilter(eventType, 0, 'latest');
      const formattedEvents = events.map(event => {
        const baseData = {
          event_type: eventType,
          contract_address: CONTRACT_ADDRESSES.rewardDistributor,
          mission_pool: event.args.missionPool,
          timestamp: new Date(Number(event.args.timestamp || event.args[event.args.length - 1]) * 1000).toISOString(),
          block_number: event.blockNumber,
          transaction_hash: event.transactionHash
        };

        switch (eventType) {
          case 'RewardSettled':
            return {
              ...baseData,
              user: event.args.user,
              base_reward: ethers.formatEther(event.args.baseReward),
              bonus_reward: ethers.formatEther(event.args.bonusReward),
              total_reward: ethers.formatEther(event.args.totalReward)
            };
          case 'TreasuryFee':
            return {
              ...baseData,
              amount: ethers.formatEther(event.args.amount)
            };
          case 'MissionSettled':
            return {
              ...baseData,
              total_participants: event.args.totalParticipants.toString(),
              total_deposited: ethers.formatEther(event.args.totalDeposited),
              total_yield: ethers.formatEther(event.args.totalYield)
            };
          default:
            return baseData;
        }
      });

      allEvents.push(...formattedEvents);
    } catch (error) {
      console.log(`Error fetching ${eventType} events:`, error.message);
    }
  }

  return allEvents;
}

async function main() {
  try {
    console.log('Starting analytics data export...');

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // Fetch all events
    const [identityEvents, factoryEvents, poolEvents, rewardEvents] = await Promise.all([
      exportIdentityBinderEvents(),
      exportMissionFactoryEvents(),
      exportMissionPoolEvents(),
      exportRewardDistributorEvents()
    ]);

    const allEvents = [...identityEvents, ...factoryEvents, ...poolEvents, ...rewardEvents];

    console.log(`Fetched ${allEvents.length} total events`);

    if (allEvents.length === 0) {
      console.log('No events found. Make sure contracts are deployed and have activity.');
      return;
    }

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: path.join(exportsDir, 'social_savings_analytics.csv'),
      header: [
        { id: 'event_type', title: 'Event Type' },
        { id: 'contract_address', title: 'Contract Address' },
        { id: 'mission_pool', title: 'Mission Pool' },
        { id: 'user', title: 'User' },
        { id: 'line_id_hash', title: 'Line ID Hash' },
        { id: 'user_address', title: 'User Address' },
        { id: 'creator', title: 'Creator' },
        { id: 'target_amount', title: 'Target Amount' },
        { id: 'cadence_seconds', title: 'Cadence (seconds)' },
        { id: 'duration_seconds', title: 'Duration (seconds)' },
        { id: 'asset_address', title: 'Asset Address' },
        { id: 'yield_strategy', title: 'Yield Strategy' },
        { id: 'reward_distributor', title: 'Reward Distributor' },
        { id: 'amount', title: 'Amount' },
        { id: 'new_streak', title: 'New Streak' },
        { id: 'total_deposited', title: 'Total Deposited' },
        { id: 'previous_streak', title: 'Previous Streak' },
        { id: 'final_streak', title: 'Final Streak' },
        { id: 'remaining_balance', title: 'Remaining Balance' },
        { id: 'base_reward', title: 'Base Reward' },
        { id: 'bonus_reward', title: 'Bonus Reward' },
        { id: 'total_reward', title: 'Total Reward' },
        { id: 'total_participants', title: 'Total Participants' },
        { id: 'total_yield', title: 'Total Yield' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'block_number', title: 'Block Number' },
        { id: 'transaction_hash', title: 'Transaction Hash' }
      ]
    });

    // Write CSV file
    await csvWriter.writeRecords(allEvents);

    console.log(`✅ Analytics data exported to ${path.join(exportsDir, 'social_savings_analytics.csv')}`);
    console.log(`📊 Total events: ${allEvents.length}`);

    // Generate summary statistics
    const summary = {
      totalEvents: allEvents.length,
      eventTypes: {},
      uniqueUsers: new Set(),
      uniqueMissionPools: new Set(),
      dateRange: {
        start: null,
        end: null
      }
    };

    allEvents.forEach(event => {
      // Count event types
      summary.eventTypes[event.event_type] = (summary.eventTypes[event.event_type] || 0) + 1;

      // Track unique users
      if (event.user) summary.uniqueUsers.add(event.user);
      if (event.user_address) summary.uniqueUsers.add(event.user_address);
      if (event.creator) summary.uniqueUsers.add(event.creator);

      // Track unique mission pools
      if (event.mission_pool) summary.uniqueMissionPools.add(event.mission_pool);

      // Track date range
      const eventDate = new Date(event.timestamp);
      if (!summary.dateRange.start || eventDate < summary.dateRange.start) {
        summary.dateRange.start = eventDate;
      }
      if (!summary.dateRange.end || eventDate > summary.dateRange.end) {
        summary.dateRange.end = eventDate;
      }
    });

    // Write summary file
    const summaryPath = path.join(exportsDir, 'analytics_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      ...summary,
      uniqueUsers: summary.uniqueUsers.size,
      uniqueMissionPools: summary.uniqueMissionPools.size,
      dateRange: {
        start: summary.dateRange.start?.toISOString(),
        end: summary.dateRange.end?.toISOString()
      }
    }, null, 2));

    console.log(`📈 Summary written to ${summaryPath}`);

  } catch (error) {
    console.error('❌ Error during export:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, exportIdentityBinderEvents, exportMissionFactoryEvents, exportMissionPoolEvents, exportRewardDistributorEvents };
