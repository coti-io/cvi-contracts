// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 supply, uint8 decimals) public ERC20(name, symbol) {
        _mint(msg.sender, supply);
        _setupDecimals(decimals);
    }
}
