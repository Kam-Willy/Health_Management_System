const HospitalManagement = artifacts.require("HospitalManagement");

module.exports = async function (deployer) {
  const name = "HospitalNFT";
  const symbol = "HPTNFT";

  await deployer.deploy(HospitalManagement, name, symbol);
};

  