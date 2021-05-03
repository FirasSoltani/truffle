const ConvertLib = artifacts.require("ConvertLib");
const TuniCoin = artifacts.require("TuniCoin");

module.exports = function (deployer) {
  deployer.deploy(TuniCoin);
};
