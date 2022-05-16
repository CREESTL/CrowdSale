const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Tasty Tomato Token", function () {

  let _ttt;
  let ttt;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    _ttt = await ethers.getContractFactory("TTT");
    ttt = await _ttt.deploy();
    await ttt.deployed();
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  describe("Deployment", function () {  
    it("Should be named TTT", async function () {
      expect(await ttt.name()).to.equal("Tasty Tomato Token");
    });

    it("Should have a TTT symbol", async function () {
      expect(await ttt.symbol()).to.equal("TTT");
    });

    it("Should have a zero total supply", async function () {
      const supply = await ttt.totalSupply();
      expect(supply).to.equal(0);
    })

  });

  describe("Transactions", function () {

    it("Should mint tokens to accounts", async function () {
      await ttt.mint(addr1.address, 100);
      const addr1Balance = await ttt.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);
    });

    it("Should transfer tokens between accounts", async function () {
      await ttt.mint(addr1.address, 100);
      const addr1Balance = await ttt.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      // Approve transfer of 50 tokens to owner
      // msg.sender = addr1
      await ttt.connect(addr1).approve(owner.address, 50);
      // owner immediately transfers 50 tokens to another address
      await ttt.transferFrom(addr1.address, addr2.address, 50);
      const addr2Balance = await ttt.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail transfer if sender has not enough tokens", async function () {

      await ttt.connect(addr1).approve(owner.address, 50);
      await expect(ttt.transferFrom(addr1.address, addr2.address, 50)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    
    });

    it("Should update balances after transfers", async function() {
      await ttt.mint(owner.address, 10000);
      const initialOwnerBalance = await ttt.balanceOf(owner.address);

      expect(initialOwnerBalance).to.equal(10000);

      // Transfer 100 tokens from owner to addr1
      await ttt.approve(addr1.address, 100);
      await ttt.transfer(addr1.address, 100);

      // Transfer 500 tokens from owner to addr2
      await ttt.approve(addr2.address, 500);
      await ttt.transfer(addr2.address, 500);

      // Check that final owner balance decreased by 600
      const finalOwnerBalance = await ttt.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(600));

      // Check that addr1 balance increased by 100
      const addr1Balance = await ttt.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      // Check that addr2 balance increased by 500
      const addr2Balance = await ttt.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(500);

    });

  });


});
