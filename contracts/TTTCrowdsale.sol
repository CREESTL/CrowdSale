// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./TTT.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// A crowdsale ICO contract
contract TTTCrowdsale is Ownable{

  using SafeMath for uint256;
  // Whitelist of users who can transfer ether to this crowdsale
  mapping(address => bool) public whitelist;

  // Opening and closing time of crowdsale
  uint256 public openingTime;
  uint256 public closingTime;
  // End time of last of three phases
  uint256 public phaseEndTime;

  // The token being sold
  TTT public token;

  // Address where funds are collected (forwarded)
  address payable public wallet;

  // How many token units a buyer gets per wei
  uint256 public rate;

  // Amount of wei raised
  uint256 public weiRaised;

  // Event raised on token purchase
  event TokenPurchase(
    address indexed purchaser, // paid for tokens
    address indexed beneficiary, // got the tokens
    uint256 value, // weis
    uint256 amount // amount tokens purchased
  );

  constructor(address _wallet, TTT _token) 
  {
    require(_wallet != address(0), "Wrong Wallet Address!");
    require(address(_token) != address(0), "Wrong Token Address!");

    // _rate = tokens * 10 ^ (decimals) / wei (sent)
    // Default rate is 42
    rate = 42;
    wallet = payable(_wallet);
    token = _token;
    // Crowdsale is open right after it's deployed
    openingTime = block.timestamp;
    // Closing time is exactly 3 days + 14 days + 30 days after opening time
    closingTime = openingTime + 47 days;
    // First phase lasts for 3 days since opening
    phaseEndTime = openingTime + 3 days;
  }

  // Function to receive ether and sell tokens to the client
  fallback() external payable {
    buyTokens(msg.sender);
  }

  receive() external payable {
    buyTokens(msg.sender);
  }

  // Getters for opening and closing time 
  function getOpeningTime() public view returns (uint256) {
    return openingTime;
  }

  function getClosingTime() public view returns (uint256) {
    return closingTime;
  }

  /*
    WHITELISTED
  */

  // Reverts if beneficiary is not whitelisted
  modifier onlyWhiteListed(address _beneficiary) {
    require(whitelist[_beneficiary], "Sender Is Not In Whitelist!");
    _;
  }

  // Adds a single address to whitelist
  function addToWhitelist(address _beneficiary) external onlyOwner {
    whitelist[_beneficiary] = true;
  }

  // Removes a single address from whitelist
  function removeFromWhitelist(address _beneficiary) external onlyOwner {
    whitelist[_beneficiary] = false;
  }
  // ======

  /*
    TIMED
  */
  // Reverts if not in crowdsale time range
  modifier onlyWhileOpen {
    // solium-disable-next-line security/no-block-members
    require(block.timestamp >= openingTime && block.timestamp <= closingTime, "Crowdsale Has Been Closed!");
    _;
  }

  // Changes phase according to current time
  modifier checkChangePhase {
    // After first 3 days starts the next 1-month phase
    if (block.timestamp > phaseEndTime) {
      // Assuming that 1 month has 30 days
      phaseEndTime += 30 days;
      rate = 21;
    // After 1-month phase starts the last 2-weeks phase
    } 
    if (block.timestamp > phaseEndTime) {
      phaseEndTime += 2 weeks;
      rate = 8;
    }
    _;
  }

  // Checks whether the period in which the crowdsale is open has ended
  function hasClosed() public view returns (bool) {
    // solium-disable-next-line security/no-block-members
    return block.timestamp > closingTime;
  }
  // ======


  /*
    MINTED
  */
  function _mintDeliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
    token.mint(_beneficiary, _tokenAmount);
  }

  // ======

  // Pre-transaction checks
  function preTransactionValidate(address _beneficiary, uint256 weiAmount) internal 
    onlyWhiteListed(_beneficiary)
    onlyWhileOpen()
    checkChangePhase()
  {
    require(_beneficiary != address(0), "Wrong Beneficiary!");
    require(weiAmount != 0, "Not Enough Wei!");
  }

  // Main function 
  // beneficiary - gets the tokens
  function buyTokens(address beneficiary) public payable {

    // Get the amount of incoming wei
    uint256 weiAmount = msg.value;

    preTransactionValidate(beneficiary, weiAmount);

    // Calculate token amount to be created
    uint256 tokens_to_get = weiAmount.mul(rate);

    // Update the number of raised funds
    weiRaised = weiRaised.add(weiAmount);

    // TODO recalculate amount of tokens here
    // Mint and send tokens to the beneficiary
    _mintDeliverTokens(beneficiary, tokens_to_get);

    emit TokenPurchase(
      msg.sender,
      beneficiary,
      weiAmount,
      tokens_to_get
    );

    // TODO choose one
    // Transfer collected funds to wallet
    wallet.transfer(msg.value);
    //wallet.call{value: msg.value};
  }

}