## Description

### Smart-contracts:
- TTT.sol
- TTTCrowdsale.sol

The first one is just a standard ERC20 token.  
The second one is a _crowdsale_ contract.

__Crowdsale Details__:
1) Three phases (periods):
  - 1 day since opening - 3 days since opening (rate = 42)
  - 3 days since opening - 1 month since opening (rate = 21)
  - 1 month since opening - 1 month and 2 weeks since opening (rate = 8)
2) Only users from the __whitelist__ can transfer ETH to the crowdsale
3) After a user tranfers ETH to the crowdsale he gets freshly minted TTT tokens. There is no fixed supply of TTT
4) Only the owner of the contract can manage the whitelist
5) All collected funds a forwarded to the wallet

### Addresses

Both contracts were deployed to Rinkeby:

* TTT.sol: [0x9A6B0831a3f90685672e6eA3974903C499AEE48c](https://rinkeby.etherscan.io/search?f=0&q=0x9A6B0831a3f90685672e6eA3974903C499AEE48c)
* TTTCrowdsale.sol: [0x99aC74699C2228D75Ccf49afB9Fd0b733bBAaBFa](https://rinkeby.etherscan.io/search?f=0&q=0x99aC74699C2228D75Ccf49afB9Fd0b733bBAaBFa)

Also the wallet was deployed to Rinkeby:  
__WARNING!__   
This is a commonly used address. Do not transfer any real ETH to it!  
[0xB41941063f09e478Fc9Bd1F8c398185f74b5Ac56](https://rinkeby.etherscan.io/search?f=0&q=0xB41941063f09e478Fc9Bd1F8c398185f74b5Ac56)  



### Hardhat project

This project was build using [Hardhat](https://hardhat.org/) framework. Because of that it has a specific structure:
- `contracts/` contains two contracts
- `flat/` contains flattened code of the same two contracts
- `package.json/` all Node.js dependencies required for the project
- `scripts/` contains a _deploy_ script (more on that later)
- `test/` contains tests for both contracts
- `hardhat.config.js` contains configuration information for the project

You should _install_ Hardhat in order to properly use the project.

### Usage

Copy this repository

```bash
git clone git@github.com:CREESTL/CrowdSale.git
cd CrowdSale
```

Install dependencies

```bash
npm i -D
```

### Create config

`hardhat.config.js` uses local data from `.env` file. You can create this file from `.env_template` file.

```bash
cp .env.template .env
```
__WARNING!__   
You are required to place you _private_ key in this file. DO NOT publish or share `.env` file.


### Scripts

To run any script enter:

```bash
npx hardhat run path/to/script.ts --network network_name
```

So for example if you want to deploy `TTT.sol` and `TTTCrowdsale.sol` to Rinkeby you need:
1) Add configuration for Rinkeby into `hardhat.config.js` (it is _already_ there)
2) Run: 
```bash
npx hardhat run scripts/deploy.js --network rinkeby
```

