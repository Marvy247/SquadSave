// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IYieldStrategy.sol";

contract MockYieldStrategy is IYieldStrategy {
    using SafeERC20 for IERC20;

    IERC20 public asset;
    uint256 public constant APR = 500; // 5% APR

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    function deposit(uint256 amount) external {
        // Transfer tokens from caller to this contract
        asset.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external {
        // Transfer tokens from this contract to caller
        asset.safeTransfer(msg.sender, amount);
    }

    function getAPR() external pure returns (uint256) {
        return APR;
    }
}
