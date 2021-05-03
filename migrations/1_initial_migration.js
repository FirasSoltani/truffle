const Migrations = artifacts.require("Migrations");
const TuniCoin = artifacts.require("TuniCoin");
module.exports = function (deployer) {
  deployer.deploy(TuniCoin);
};
