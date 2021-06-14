// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6;

interface IRewardsCollector {
	function reward(address account, uint256 positionUnits, uint8 leverage) external;
}
