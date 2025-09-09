// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Test.sol";
import "../src/IdentityBinder.sol";

contract IdentityBinderTest is Test {
    IdentityBinder identityBinder;
    address owner = address(1);
    address user1 = address(2);
    address user2 = address(3);
    bytes32 lineId1 = keccak256("lineId1");
    bytes32 lineId2 = keccak256("lineId2");

    function setUp() public {
        identityBinder = new IdentityBinder(owner);
    }

    function testBindAddress() public {
        vm.prank(owner);
        identityBinder.bindAddress(lineId1, user1);

        assertEq(identityBinder.lineIdHashToAddress(lineId1), user1);
        assertEq(identityBinder.addressToLineIdHash(user1), lineId1);
    }

    function testBindAddressOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        identityBinder.bindAddress(lineId1, user1);
    }

    function testBindAddressAlreadyBound() public {
        vm.startPrank(owner);
        identityBinder.bindAddress(lineId1, user1);

        vm.expectRevert("ID already bound");
        identityBinder.bindAddress(lineId1, user2);

        vm.expectRevert("Address already bound");
        identityBinder.bindAddress(lineId2, user1);
        vm.stopPrank();
    }

    function testOwnership() public {
        assertEq(identityBinder.owner(), owner);

        vm.prank(owner);
        identityBinder.transferOwnership(user1);
        assertEq(identityBinder.owner(), user1);
    }
}
