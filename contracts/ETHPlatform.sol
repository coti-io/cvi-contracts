// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IPlatform.sol";
import "./interfaces/IETHPlatform.sol";
import "./interfaces/IWETH.sol";
import "./Platform.sol";


contract ETHPlatform is Platform, IETHPlatform {

    IWETH public immutable wethToken;

    constructor(address _wethToken, string memory _lpTokenName, string memory _lpTokenSymbolName, uint256 _initialTokenToLPTokenRate,
        IFeesModel _feesModel, 
        IFeesCalculator _feesCalculator,
        ICVIOracle _cviOracle,
        ILiquidation _liquidation) public Platform(IERC20(_wethToken), _lpTokenName, _lpTokenSymbolName, _initialTokenToLPTokenRate, _feesModel, _feesCalculator, _cviOracle, _liquidation) {
            wethToken = IWETH(_wethToken);
    }

    receive() external payable override {

    }

    function depositETH(uint256 _minLPTokenAmount) external override payable returns (uint256 lpTokenAmount) {
        wethToken.deposit{value: msg.value}();
        lpTokenAmount = _deposit(msg.value, _minLPTokenAmount, false);
    }

    function withdrawETH(uint256 _tokenAmount, uint256 _maxLPTokenBurnAmount) external override returns (uint256 burntAmount, uint256 withdrawnAmount) {
    	(burntAmount, withdrawnAmount) = _withdraw(_tokenAmount, false, _maxLPTokenBurnAmount, false);
        sendETH(withdrawnAmount);
    }

    function withdrawLPTokensETH(uint256 _lpTokensAmount) external override returns (uint256 burntAmount, uint256 withdrawnAmount) {
    	(burntAmount, withdrawnAmount) = _withdraw(0, true, _lpTokensAmount, false);
    	sendETH(withdrawnAmount);
    }

    function openPositionETH(uint16 _maxCVI) external override payable returns (uint256 positionUnitsAmount) {
        wethToken.deposit{value: msg.value}();
        positionUnitsAmount = _openPosition(msg.value, _maxCVI, false);
    }

    function closePositionETH(uint256 _positionUnitsAmount, uint16 _minCVI) external override returns (uint256 tokenAmount) {
        tokenAmount = _closePosition(_positionUnitsAmount, _minCVI, false);
        sendETH(tokenAmount);
    }

    function sendETH(uint256 _amount) private {
    	wethToken.withdraw(_amount);
        msg.sender.transfer(_amount);
    }
}
