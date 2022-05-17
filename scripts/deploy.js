// SPDX-License-Identifier: MIT 
const hre = require("hardhat");

/*
  Run it with `npx hardhat run --network *desired network name*`
*/

async function main() {

  // Get different avaliable addresses
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  
  // We get the contract to deploy
  // Deploy the token
  _ttt = await ethers.getContractFactory("TTT");
  ttt = await _ttt.deploy();
  await ttt.deployed();

  // Deploy the crowdsale
  _tttCrowdsale = await ethers.getContractFactory("TTTCrowdsale");
  tttCrowdsale = await _tttCrowdsale.deploy(owner.address, ttt.address);
  await tttCrowdsale.deployed();

  console.log("TTT deployed to:", ttt.address);
  console.log("TTTCrowdsale deployed to:", tttCrowdsale.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
