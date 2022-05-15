// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract TTT is ERC20 {
    constructor() ERC20("Tasty Tomato Token", "TTT") {}

    // Make internal _mint() public
    function mint(address account, uint amount) public {
        _mint(account, amount);
    } 
}