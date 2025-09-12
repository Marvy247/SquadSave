// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {USDT} from "../src/USDT.sol";

contract DeployUSDT is Script {
    function run() external returns (address) {
        vm.startBroadcast();
        USDT usdt = new USDT();
        vm.stopBroadcast();
        return address(usdt);
    }
}
