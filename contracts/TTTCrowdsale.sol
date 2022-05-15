pragma solidity ^0.8.4;

import "./TTT.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


// A crowdsale ICO contract
contract TTTCrowdsale {

  using SafeMath for uint256;

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


  constructor(uint256 _rate, address _wallet, TTT _token) {
    require(_rate > 0, "Wrong Rate!");
    require(_wallet != address(0), "Wrong Wallet Address!");
    require(address(_token) != address(0), "Wrong Token Address!");

    rate = _rate;
    wallet = payable(_wallet);
    token = _token;
  }


  fallback() external payable {
    buyTokens(msg.sender);
  }

  receive() external payable {
    buyTokens(msg.sender);
  }

  // Pre-transaction checks
  function preTransactionValidate(address _beneficiary, uint256 weiAmount) internal {
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

    // Emit tokens to the beneficiary
    token.transfer(beneficiary, tokens_to_get);

    emit TokenPurchase(
      msg.sender,
      beneficiary,
      weiAmount,
      tokens_to_get
    );

    // TODO choose one
    // wallet.transfer(msg.value);
    wallet.call{value: msg.value};
  }

}