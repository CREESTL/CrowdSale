// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./TTT.sol";
import "./Crowdsale.sol";
import "./WhitelistedCrowdsale.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


// A crowdsale ICO contract
contract TTTCrowdsale is WhitelistedCrowdsale {

  constructor(uint256 _rate, address _wallet, TTT _token) 
    WhitelistedCrowdsale(_rate, _wallet, _token)
  {}

}