// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/IdentityBinder.sol";
import "../src/MissionFactory.sol";
import "../src/RewardDistributor.sol";
import "../src/MockYieldStrategy.sol";
import "../src/MissionPool.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        // Deploy IdentityBinder
        IdentityBinder identityBinder = new IdentityBinder(deployer);
        console.log("IdentityBinder deployed at:", address(identityBinder));

        // Deploy MockYieldStrategy (for testing/demo purposes)
        MockYieldStrategy mockYieldStrategy = new MockYieldStrategy(address(0)); // Will be set later
        console.log("MockYieldStrategy deployed at:", address(mockYieldStrategy));

        // Deploy RewardDistributor
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        uint256 feeBps = 500; // 5% fee
        RewardDistributor rewardDistributor = new RewardDistributor(treasury, feeBps);
        console.log("RewardDistributor deployed at:", address(rewardDistributor));

        // Deploy MissionFactory
        MissionFactory missionFactory = new MissionFactory(deployer);
        console.log("MissionFactory deployed at:", address(missionFactory));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("IdentityBinder:", address(identityBinder));
        console.log("MockYieldStrategy:", address(mockYieldStrategy));
        console.log("RewardDistributor:", address(rewardDistributor));
        console.log("MissionFactory:", address(missionFactory));
        console.log("Treasury:", treasury);
        console.log("Fee BPS:", feeBps);
    }
}
