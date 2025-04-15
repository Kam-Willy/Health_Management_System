// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

abstract contract PatientManagement {
    struct Patient {
        address wallet;
        string name;
        uint8 age;
        uint16 bedId;
        bool admitted;
        uint256 bill;
        bool paid;
        string diagnosis;
        uint8 confidence;
    }

    mapping(uint256 => Patient) public patients;
    mapping(uint256 => bool) public hospitalBeds;
    uint256 public patientCounter;

    event PatientAdmitted(uint256 indexed patientId);
    event PatientDischarged(uint256 indexed patientId);
    event DiagnosisRecorded(uint256 indexed patientId, string diagnosis, uint8 confidence);

    modifier onlyStaff() virtual;

    function _admitPatient(
        address _wallet, string memory _name, uint8 _age, uint16 _bedId
    ) internal {
        require(_wallet != address(0), "Invalid wallet address");
        require(!hospitalBeds[_bedId], "Bed already occupied");

        patients[patientCounter] = Patient(_wallet, _name, _age, _bedId, true, 0, false, "", 0);
        hospitalBeds[_bedId] = true;

        emit PatientAdmitted(patientCounter);
        patientCounter++;
    }

    function _dischargePatient(uint256 patientId) internal {
        require(patients[patientId].admitted, "Not admitted");
        require(patients[patientId].paid, "Bill unpaid");

        hospitalBeds[patients[patientId].bedId] = false;
        patients[patientId].admitted = false;

        emit PatientDischarged(patientId);
    }

    function _recordDiagnosis(uint256 patientId, string memory _diagnosis, uint8 _confidence) internal {
        require(patients[patientId].admitted, "Not admitted");
        require(_confidence <= 100, "Confidence must be 0-100");
        require(bytes(_diagnosis).length > 0, "Diagnosis required");

        patients[patientId].diagnosis = _diagnosis;
        patients[patientId].confidence = _confidence;

        emit DiagnosisRecorded(patientId, _diagnosis, _confidence);
    }
}
