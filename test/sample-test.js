const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TTT", function () {
  it("Should be named TTT", async function () {
    const _ttt = await ethers.getContractFactory("TTT");
    const ttt = await _ttt.deploy();
    await ttt.deployed();

    expect(await ttt.name()).to.equal("Tasty Tomato Token");
  });
});
