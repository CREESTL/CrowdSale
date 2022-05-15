pragma solidity ^0.8.0;

import "./TTTCrowdsale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// Crowdsale in which only whitelisted users can contribute.
contract WhitelistedCrowdsale is TTTCrowdsale, Ownable {

  // Whitelist of addresses
  mapping(address => bool) public whitelist;

  
  // Reverts if beneficiary is not whitelisted. Can be used when extending this contract.
  modifier isWhitelisted(address _beneficiary) {
    require(whitelist[_beneficiary]);
    _;
  }


  constructor(uint256 _rate, address _wallet, TTT _token) {
    require(_rate > 0, "Wrong Rate!");
    require(_wallet != address(0), "Wrong Wallet Address!");
    require(address(_token) != address(0), "Wrong Token Address!");

    rate = _rate;
    wallet = payable(_wallet);
    token = _token;
  }

  // Adds single address to whitelist.
  // _beneficiary - address to be added to the whitelist
  function addToWhitelist(address _beneficiary) external onlyOwner {
    whitelist[_beneficiary] = true;
  }

  // Removes single address from whitelist.
  // _beneficiary - address to be removed to the whitelist
  function removeFromWhitelist(address _beneficiary) external onlyOwner {
    whitelist[_beneficiary] = false;
  }


  // Extend parent behavior requiring beneficiary to be in whitelist.
  // _beneficiary Token beneficiary
  // _weiAmount Amount of wei contributed
  function _preTransactionValidate(address _beneficiary, uint256 _weiAmount) internal isWhitelisted(_beneficiary) {
    super.preTransactionValidate(_beneficiary, _weiAmount);
  }

}