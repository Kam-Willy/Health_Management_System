const HospitalManagement = artifacts.require("HospitalManagement");

contract("HospitalManagement", (accounts) => {
  let hospital;
  const owner = accounts[0];
  const staff = accounts[1];
  const patient = accounts[2];

  beforeEach(async () => {
    hospital = await HospitalManagement.new("HospitalNFT", "HPTNFT");
    await hospital.addStaff(staff, "Dr. Strange", "Surgeon", { from: owner });
  });

  it("should handle full patient lifecycle", async () => {
    await hospital.admitPatient(patient, "Peter Parker", 25, 5, { from: staff });
    await hospital.addBillItem(1, "Surgery", web3.utils.toWei("3", "ether"), { from: staff });
    await hospital.recordDiagnosis(1, "Broken Arm", 90, { from: staff });
    await hospital.payBill(1, { from: patient, value: web3.utils.toWei("3", "ether") });
    await hospital.dischargePatient(1, { from: staff });

    const patientData = await hospital.getPatient(1);
    assert.equal(patientData.admitted, false, "Patient should be discharged");
    assert.equal(patientData.paid, true, "Bill should be paid");
    assert.equal(patientData.diagnosis, "Broken Arm", "Diagnosis mismatch");
  });
});
