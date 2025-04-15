const HospitalManagement = artifacts.require("HospitalManagement");

contract("StaffManagement", (accounts) => {
  let hospital;
  const owner = accounts[0];
  const newStaff = accounts[1];

  beforeEach(async () => {
    hospital = await HospitalManagement.new("HospitalNFT", "HPTNFT");
  });

  it("should allow the owner to add staff", async () => {
    await hospital.addStaff(newStaff, "Nurse Joy", "Nurse", { from: owner });
    const employee = await hospital.employees(1);
    assert.equal(employee.name, "Nurse Joy", "Staff name mismatch");
    assert.equal(employee.role, "Nurse", "Staff role mismatch");
    assert.equal(employee.wallet, newStaff, "Staff wallet mismatch");
  });

  it("should prevent non-owners from adding staff", async () => {
    try {
      await hospital.addStaff(accounts[2], "Dr. Evil", "Surgeon", { from: newStaff });
      assert.fail("Non-owner should not be able to add staff");
    } catch (error) {
      assert(error.message.includes("Ownable: caller is not the owner"), "Expected ownable restriction");
    }
  });
});
