pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract TTT is ERC20, ERC20Burnable {
    constructor() ERC20("Tasty Tomato Token", "TTT") {
    }
}