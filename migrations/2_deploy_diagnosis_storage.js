const DiagnosisStorage = artifacts.require("DiagnosisStorage");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(DiagnosisStorage);
  const deployed = await DiagnosisStorage.deployed();

  console.log("DiagnosisStorage deployed at:", deployed.address);
};
