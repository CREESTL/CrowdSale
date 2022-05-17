// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");


// Tests for TTTCrowdsale.sol
describe("TTT Crowdsale", function () {

  // Constants to be used afterwards
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

  // Hook 
  beforeEach(async function () {

    // Get different avaliable addresses
    // Make one of them a wallet to collect funds
    [owner, addr1, addr2, wallet, ...addrs] = await ethers.getSigners();

    // Deploy the token
    _ttt = await ethers.getContractFactory("TTT");
    ttt = await _ttt.deploy();
    await ttt.deployed();

    // Deploy the crowdsale
    // It opens immediately
    _tttCrowdsale = await ethers.getContractFactory("TTTCrowdsale");
    tttCrowdsale = await _tttCrowdsale.deploy(wallet.address, ttt.address);
    await tttCrowdsale.deployed();
    // Get opening and closing time of crowdsale
    tttCrowdsaleOpeningTime = await tttCrowdsale.getOpeningTime();
    tttCrowdsaleClosingTime = await tttCrowdsale.getClosingTime();
    
  });


  describe("Deployment", function () {  

    it("Should be open after deploying", async function() {
      expect(await tttCrowdsale.hasClosed()).to.be.false;
    });
    
    it("Should stay open till closing time", async function() {
      // After 3 days it should stay open
      // NOTE: represent time in seconds as Solidity does so
      const threeDays = new Date(3 * 24 * 3600);
      await network.provider.send("evm_setNextBlockTimestamp", [+tttCrowdsaleOpeningTime + threeDays.getTime()]);
      await network.provider.send("evm_mine");
      expect(await tttCrowdsale.hasClosed()).to.be.false;

      // After 3 days + 1 month (33days) it should stay open
      const oneMonth = new Date(30 * 24 * 3600);
      await network.provider.send("evm_setNextBlockTimestamp", [+tttCrowdsaleOpeningTime + threeDays.getTime() + oneMonth.getTime()]);
      await network.provider.send("evm_mine");
      expect(await tttCrowdsale.hasClosed()).to.be.false;

      // Expected closing time is 47 days away from opening time
      const fourtySevenDays = new Date(47 * 24 * 3600);
      // Add one more second to close the crowdsale
      const oneSecond = new Date(1);
      const expectedClosingTime = new Date(+tttCrowdsaleOpeningTime + fourtySevenDays.getTime() + oneSecond.getTime());
      expect(+tttCrowdsaleClosingTime).to.be.below(+expectedClosingTime);

    });


    it ("Should be closed after closing time", async function () {
      const tenSeconds = new Date(10);
      await network.provider.send("evm_setNextBlockTimestamp", [+tttCrowdsaleClosingTime + tenSeconds.getTime()]);
      await network.provider.send("evm_mine");
      expect(await tttCrowdsale.hasClosed()).to.be.true;

    })

  });


  describe("Transactions", function () {

    it("Should allow only whitelisted addresses", async function () {
      // Try sending transaction from non-whitelisted account
      const tx =  {
        to: tttCrowdsale.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 300000,        
      }
      await expect(owner.sendTransaction(tx)).to.be.revertedWith("Sender Is Not In Whitelist!");
        
      // Add owner to whitelist
      await tttCrowdsale.addToWhitelist(owner.address);
      await expect(owner.sendTransaction(tx)).to.not.be.reverted;

      // Remove owner from whitelist and try again
      await tttCrowdsale.removeFromWhitelist(owner.address);
      await expect(owner.sendTransaction(tx)).to.be.revertedWith("Sender Is Not In Whitelist!");

    });

    it("Should mint & transfer tokens to beneficiary", async function () {
      // Get owner's current balance of TTT
      const initialOwnerBalance = await ttt.balanceOf(owner.address);
      expect(initialOwnerBalance).to.equal(0);

      // Get current token totalSupply
      const initialSupply = await ttt.totalSupply();
      
      // Add owner to whitelist
      await tttCrowdsale.addToWhitelist(owner.address);
      // Owner sends some ether to crowdsale
      await owner.sendTransaction(
      {
        to: tttCrowdsale.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 300000,
      });

      // His final TTT balance should increase
      // (the exact increasement depends on the phase)
      const finalOwnerBalance = await ttt.balanceOf(owner.address);
      expect(initialOwnerBalance).to.be.below(finalOwnerBalance);

      // totalSupply of tokens should increase as well
      const finalSupply = await ttt.totalSupply();
      expect(finalSupply).to.be.above(initialSupply);

    });

    it("Should collect funds in a wallet", async function () {
      // Get wallets's current balance of ether
      const initialWalletBalance = await wallet.getBalance();

      // Add owner to whitelist
      await tttCrowdsale.addToWhitelist(owner.address);
      // Owner sends 1 ether to crowdsale
      await owner.sendTransaction(
      {
        to: tttCrowdsale.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 300000,
      });

      // Ether from owner should be transfered to wallet
      const finalWalletBalance = await wallet.getBalance();
      expect(finalWalletBalance).to.be.equal(initialWalletBalance.add(ethers.utils.parseEther("1")));
      
      // Number of wei raised should be 10**18
      const finalWeiRaised = await tttCrowdsale.getWeiRaised();
      await expect(finalWeiRaised).to.equal(ethers.utils.parseEther("1"));

    });

    it("Should have rate of 42 at first phase", async function () {
      // Get owner's current balance of TTT
      const initialOwnerBalance = await ttt.balanceOf(owner.address);
      expect(initialOwnerBalance).to.equal(0);
      
      // Add owner to whitelist
      await tttCrowdsale.addToWhitelist(owner.address);
      // Owner sends 1 ether to crowdsale
      await owner.sendTransaction(
      {
        to: tttCrowdsale.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 300000,
      });

      // His final TTT balance should increase by 42
      const finalOwnerBalance = await ttt.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.add(ethers.utils.parseUnits("42")));
    });

    it("Should have rate of 21 at second phase", async function () {
      // Get owner's current balance of TTT
      const initialOwnerBalance = await ttt.balanceOf(owner.address);
      expect(initialOwnerBalance).to.equal(0);

      // Skip 3 days
      // Second phase should start
      const threeDays = new Date(3 * 24 * 3600);
      await network.provider.send("evm_setNextBlockTimestamp", [+tttCrowdsaleOpeningTime + threeDays.getTime()]);
      await network.provider.send("evm_mine");
      
      // Add owner to whitelist
      await tttCrowdsale.addToWhitelist(owner.address);
      // Owner sends 1 ether to crowdsale
      await owner.sendTransaction(
      {
        to: tttCrowdsale.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 300000,
      });

      // His final TTT balance should increase by 21
      const finalOwnerBalance = await ttt.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.add(ethers.utils.parseUnits("21")));
    });    

    it("Should have rate of 8 at third phase", async function () {
      // Get owner's current balance of TTT
      const initialOwnerBalance = await ttt.balanceOf(owner.address);
      expect(initialOwnerBalance).to.equal(0);

      // Skip 3 days + 1 month (33 days)
      // Second phase should start
      const threeDays = new Date(3 * 24 * 3600);
      const oneMonth = new Date(30 * 24 * 3600);
      await network.provider.send("evm_setNextBlockTimestamp", [+tttCrowdsaleOpeningTime + threeDays.getTime() + oneMonth.getTime()]);
      await network.provider.send("evm_mine");
      
      // Add owner to whitelist
      await tttCrowdsale.addToWhitelist(owner.address);
      // Owner sends 1 ether to crowdsale
      await owner.sendTransaction(

      {
        to: tttCrowdsale.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 300000,
      });

      // His final TTT balance should increase by 8
      const finalOwnerBalance = await ttt.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.add(ethers.utils.parseUnits("8")));
    });

  });

});
