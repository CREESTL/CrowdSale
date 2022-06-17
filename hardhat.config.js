require('dotenv').config()
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

// Add some .env individual variables
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      gas: 2100000,
      gasPrice: 8000000000,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: RINKEBY_PRIVATE_KEY ? [RINKEBY_PRIVATE_KEY] : [],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
}
