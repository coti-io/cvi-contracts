// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6;

import "./IPlatformV3.sol";

interface IPositionRewardsV3 {
	event Claimed(address indexed account, uint256 rewardAmount);

	function claimReward() external;
	function calculatePositionReward(uint256 positionUnits, uint256 positionTimestamp) external view returns (uint256 rewardAmount);

	function setRewarder(address newRewarder) external;
	function setMaxDailyReward(uint256 newMaxDailyReward) external;	
	function setRewardCalculationParameters(uint256 newMaxSingleReward, uint256 rewardMaxLinearPositionUnits, uint256 rewardMaxLinearGOVI) external;
	function setRewardFactor(uint256 newRewardFactor) external;
	function setMaxClaimPeriod(uint256 newMaxClaimPeriod) external;
  	function setMaxRewardTime(uint256 newMaxRewardTime) external;
  	function setMaxRewardTimePercentageGain(uint256 _newMaxRewardTimePercentageGain) external;
	function setPlatform(IPlatformV3 newPlatform) external;
}
