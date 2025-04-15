const DiagnosisStorage = artifacts.require("DiagnosisStorage");
const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");

contract("DiagnosisStorage", accounts => {
  const [owner, doctor, patient, stranger, doctor2] = accounts;
  let diagnosis;

  beforeEach(async () => {
    diagnosis = await DiagnosisStorage.new({ from: owner });
    await diagnosis.authorizeDoctor(doctor, { from: owner });
  });

  it("Should store and retrieve a diagnosis", async () => {
    await diagnosis.storeDiagnosis(
      patient,
      "Cough, Fever",
      "Flu",
      "Pneumonia",
      85,
      72,
      { from: doctor }
    );

    const data = await diagnosis.getDiagnosis(patient, { from: doctor });
    assert.equal(data.symptoms, "Cough, Fever");
    assert.equal(data.model1Prediction, "Flu");
    assert.equal(data.model2Prediction, "Pneumonia");
    assert.equal(data.confidence1, 85);
    assert.equal(data.confidence2, 72);
  });

  it("Should reject diagnosis storage by unauthorized account", async () => {
    await expectRevert(
      diagnosis.storeDiagnosis(
        patient,
        "Headache",
        "Migraine",
        "Cluster",
        75,
        66,
        { from: stranger }
      ),
      "Not authorized"
    );
  });

  it("Should only allow admin to authorize a doctor", async () => {
    await expectRevert(
      diagnosis.authorizeDoctor(doctor2, { from: doctor }),
      "Only admin can perform this"
    );

    await diagnosis.authorizeDoctor(doctor2, { from: owner });
    // No revert = passed
  });

  it("Should prevent storing a diagnosis for the same patient twice", async () => {
    await diagnosis.storeDiagnosis(
      patient,
      "Cough, Fever",
      "Flu",
      "Pneumonia",
      85,
      72,
      { from: doctor }
    );

    await expectRevert(
      diagnosis.storeDiagnosis(
        patient,
        "Cough, Fever",
        "Flu",
        "Pneumonia",
        85,
        72,
        { from: doctor }
      ),
      "Diagnosis already exists"
    );
  });

  it("Should only allow doctor or patient to access diagnosis", async () => {
    await diagnosis.storeDiagnosis(
      patient,
      "Cough, Fever",
      "Flu",
      "Pneumonia",
      85,
      72,
      { from: doctor }
    );

    await expectRevert(
      diagnosis.getDiagnosis(patient, { from: stranger }),
      "Access denied"
    );
  });

  it("Should revoke doctor access and prevent further diagnoses", async () => {
    await diagnosis.revokeDoctor(doctor, { from: owner });

    await expectRevert(
      diagnosis.storeDiagnosis(
        patient,
        "Cough",
        "Flu",
        "COVID",
        80,
        75,
        { from: doctor }
      ),
      "Not authorized"
    );
  });

  it("Should emit DiagnosisRecorded event", async () => {
    const tx = await diagnosis.storeDiagnosis(
      patient,
      "Fatigue",
      "Anemia",
      "Diabetes",
      70,
      68,
      { from: doctor }
    );

    expectEvent(tx, "DiagnosisRecorded", {
      patientId: patient,
      model1Prediction: "Anemia",
      model2Prediction: "Diabetes"
    });
  });

  it("Should return correct diagnosis count", async () => {
    const initialCount = await diagnosis.getDiagnosisCount();
    assert.equal(initialCount.toNumber(), 0);

    await diagnosis.storeDiagnosis(
      patient,
      "Sneezing",
      "Cold",
      "Allergy",
      90,
      88,
      { from: doctor }
    );

    const finalCount = await diagnosis.getDiagnosisCount();
    assert.equal(finalCount.toNumber(), 1);
  });
});
