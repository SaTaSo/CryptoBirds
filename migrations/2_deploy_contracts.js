var CryptoBirds = artifacts.require("./CryptoBirds.sol");
module.exports = function(deployer) {
  deployer.deploy(CryptoBirds);
};
