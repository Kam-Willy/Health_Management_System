const HospitalManagement = artifacts.require("HospitalManagement");

contract("Billing", (accounts) => {
  let hospital;
  const staff = accounts[1];
  const patient = accounts[2];

  beforeEach(async () => {
    hospital = await HospitalManagement.new("HospitalNFT", "HPTNFT");
    await hospital.addStaff(staff, "Dr. House", "Physician", { from: accounts[0] });
    await hospital.admitPatient(patient, "Gregory", 50, 4, { from: staff });
  });

  it("should add bill items and calculate total", async () => {
    await hospital.addBillItem(1, "Consultation", web3.utils.toWei("0.5", "ether"), { from: staff });
    await hospital.addBillItem(1, "X-Ray", web3.utils.toWei("1", "ether"), { from: staff });
    const total = await hospital.getBillTotal(1);
    assert.equal(total.toString(), web3.utils.toWei("1.5", "ether"), "Total bill mismatch");
  });

  it("should process payment and mark bill as paid", async () => {
    await hospital.addBillItem(1, "MRI", web3.utils.toWei("2", "ether"), { from: staff });
    await hospital.payBill(1, { from: patient, value: web3.utils.toWei("2", "ether") });
    const patientData = await hospital.getPatient(1);
    assert.equal(patientData.paid, true, "Bill should be marked as paid");
  });
});
