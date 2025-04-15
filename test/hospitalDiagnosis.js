// test/HospitalDiagnosis.js (Integration Tests)

const HospitalManagement = artifacts.require("HospitalManagement");
const DiagnosisStorage = artifacts.require("DiagnosisStorage");

contract("Hospital & Diagnosis Integration", accounts => {
  const [owner, staff, patient1] = accounts;

  let hospital, diagnosis;

  beforeEach(async () => {
    hospital = await HospitalManagement.new("HospitalNFT", "HPTNFT", { gas: 5000000});
    diagnosis = await DiagnosisStorage.new();

    await hospital.addStaff(staff, "Dr. Alice", "Physician", { from: owner });
    await diagnosis.authorizeDoctor(staff, { from: owner });
  });

  it("Full integration: Admit → Diagnose → Bill → Pay → Discharge", async () => {
    await hospital.admitPatient(patient1, "Mary", 40, 3, { from: staff });
    await hospital.addBillItem(1, "MRI", 1000, { from: staff });

    await diagnosis.storeDiagnosis(
      patient1,
      "Chest pain",
      "Cardiac",
      "Gastritis",
      90,
      45,
      { from: staff }
    );

    await hospital.payBill(1, { from: patient1, value: 1000 });
    await hospital.dischargePatient(1, { from: staff });

    const patientFinal = await hospital.patients(1);
    assert.equal(patientFinal.admitted, false);
    assert.equal(patientFinal.paid, true);
  });
});