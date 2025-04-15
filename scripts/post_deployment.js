const HospitalManagement = artifacts.require("HospitalManagement");

module.exports = async function(callback) {
  try {
    const accounts = await web3.eth.getAccounts(); // use Truffle-provided web3

    const hospitalManagement = await HospitalManagement.deployed();

    const owner = accounts[0]; // Deployer
    const staff1 = accounts[1];
    const staff2 = accounts[2];
    const patientWallet = accounts[3];
    const patientId = 1; // patientCounter started at 1

    console.log("➕ Adding Staff...");
    await hospitalManagement.addStaff(staff1, "Dr. John Andrew", "Doctor", { from: owner });
    await hospitalManagement.addStaff(staff2, "Nurse Jane", "Nurse", { from: owner });

    console.log("🏥 Admitting Patient...");
    await hospitalManagement.admitPatient(patientWallet, "Alice Smith", 30, 1, { from: staff1 });

    console.log("🧾 Adding Bill Items...");
    await hospitalManagement.addBillItem(patientId, "Consultation Fee", web3.utils.toWei("0.5", "ether"), { from: staff2 });
    await hospitalManagement.addBillItem(patientId, "Surgery Fee", web3.utils.toWei("2", "ether"), { from: staff2 });

    const totalBill = web3.utils.toWei("2.5", "ether");
    console.log(`💰 Patient paying bill of ${web3.utils.fromWei(totalBill, "ether")} ETH...`);
    await hospitalManagement.payBill(patientId, { from: patientWallet, value: totalBill });

    console.log("🏁 Discharging Patient...");
    await hospitalManagement.dischargePatient(patientId, { from: staff1 });

    console.log("✅ Post-deployment script completed!");
    callback();
  } catch (err) {
    console.error("❌ Script failed:", err);
    callback(err);
  }
};
