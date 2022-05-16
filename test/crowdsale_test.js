// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("TTT Crowdsale", function () {

  let _ttt;
  let ttt;
  let _tttCrowdsale;
  let tttCrowdsale;
  let tttCrowdsaleOpeningTime;
  let tttCrowdsaleClosingTime
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {

    // Get different avaliable addresses
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the token
    _ttt = await ethers.getContractFactory("TTT");
    ttt = await _ttt.deploy();
    await ttt.deployed();

    // Deploy the crowdsale
    _tttCrowdsale = await ethers.getContractFactory("TTTCrowdsale");
    tttCrowdsale = await _tttCrowdsale.deploy(owner.address, ttt.address, Date.now());
    tttCrowdsaleOpeningTime = await tttCrowdsale.getOpeningTime();
    tttCrowdsaleClosingTime = await tttCrowdsale.getClosingTime();
    
    await tttCrowdsale.deployed();


  });

  describe("Deployment", function () {  
    
    it("Should have a correct closing time", async function() {
      // Expected closing time is 50 days away from opening time
      let fiftyDays = new Date(50 * 24 * 3600 * 1000);
      let expectedClosingTime = new Date(+tttCrowdsaleOpeningTime + fiftyDays.getTime());
      expect(+tttCrowdsaleClosingTime).to.be.below(+expectedClosingTime);
    });

    it("Should be open", async function() {
      expect(await tttCrowdsale.hasClosed()).to.be.false;
    });

    it ("Should be closed after closing time", async function () {
      let tenSeconds = new Date(10 * 1000);
      await network.provider.send("evm_setNextBlockTimestamp", [+tttCrowdsaleClosingTime + tenSeconds.getTime()]);
      await network.provider.send("evm_mine");
      expect(await tttCrowdsale.hasClosed()).to.be.true;

    })

  });

  describe("Transactions", function () {

    it("Should transfer some tokens to beneficiary", async function () {
      // Get owner's current balance of TTT
      const initialOwnerBalance = await ttt.balanceOf(owner.address);
      expect(initialOwnerBalance).to.equal(0);
      // Add owner to whitelist
      await tttCrowdsale.addToWhitelist(owner.address);
      // Owner sends some ether to crowdsale
      await owner.sendTransaction(
      {
        to: tttCrowdsale.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 25000,
        //gasPrice: 407578325,
      });

      // His final TTT balance should increase
      const finalOwnerBalance = await ttt.balanceOf(owner.address);
      expect(initialOwnerBalance).to.be.below(finalOwnerBalance);
    });

    it("Should allow only whitelisted addresses", async function () {

    });


  });

});
