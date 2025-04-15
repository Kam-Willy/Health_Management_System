const HospitalManagement = artifacts.require("HospitalManagement");

contract("PatientManagement", (accounts) => {
  let hospital;
  const staff = accounts[1];
  const patient = accounts[2];

  beforeEach(async () => {
    hospital = await HospitalManagement.new("HospitalNFT", "HPTNFT");
    await hospital.addStaff(staff, "Dr. Smith", "Physician", { from: accounts[0] });
  });

  it("should admit a patient and assign a bed", async () => {
    await hospital.admitPatient(patient, "John Doe", 30, 1, { from: staff });
    const patientData = await hospital.getPatient(1);
    assert.equal(patientData.name, "John Doe", "Patient name mismatch");
    assert.equal(patientData.admitted, true, "Patient should be admitted");
  });

  it("should record a diagnosis with confidence level", async () => {
    await hospital.admitPatient(patient, "Jane Doe", 28, 2, { from: staff });
    await hospital.recordDiagnosis(2, "Flu", 85, { from: staff });
    const patientData = await hospital.getPatient(2);
    assert.equal(patientData.diagnosis, "Flu", "Diagnosis mismatch");
    assert.equal(patientData.confidence, 85, "Confidence level mismatch");
  });

  it("should discharge a patient after bill payment", async () => {
    await hospital.admitPatient(patient, "Alice", 40, 3, { from: staff });
    await hospital.addBillItem(3, "Treatment", web3.utils.toWei("1", "ether"), { from: staff });
    await hospital.payBill(3, { from: patient, value: web3.utils.toWei("1", "ether") });
    await hospital.dischargePatient(3, { from: staff });
    const patientData = await hospital.getPatient(3);
    assert.equal(patientData.admitted, false, "Patient should be discharged");
  });
});
