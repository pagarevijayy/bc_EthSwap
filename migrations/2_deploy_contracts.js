/* eslint-disable no-undef */
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
  //deploy token
  await deployer.deploy(Token);
  const token = await Token.deployed();

  
  // deploy swap contract
  await deployer.deploy(EthSwap);
  const ethSwap = await EthSwap.deployed();

  // transfer all tokens to EthSwap (1M)
  const initialSupply = '1000000000000000000000000' // 1 million (with 18 decimal points)

  await token.transfer(ethSwap.address, initialSupply);

};
