// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract DiagnosisStorage {
    struct Diagnosis {
        uint256 patientId;
        string[] symptoms;
        string predictionLR;
        string predictionNN;
        uint256 confidenceNN;
        address recordedBy;
        address patientAddress;
    }

    Diagnosis[] public allDiagnoses;
    mapping(uint256 => Diagnosis) public patientDiagnoses;
    mapping(uint256 => bool) public hasDiagnosis;
    mapping(address => bool) public authorizedDoctors;

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this");
        _;
    }

    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "Not an authorized doctor");
        _;
    }

    modifier onlyPatientOrDoctor(uint256 _patientId) {
        require(
            msg.sender == patientDiagnoses[_patientId].patientAddress ||
            msg.sender == patientDiagnoses[_patientId].recordedBy,
            "Access denied"
        );
        _;
    }

    event DiagnosisRecorded(
        uint256 indexed patientId,
        string predictionLR,
        string predictionNN,
        uint256 confidenceNN
    );

    constructor() {
        admin = msg.sender;
        authorizedDoctors[admin] = true; // ✅ Auto-authorize admin as doctor
    }

    function authorizeDoctor(address _doctor) public onlyAdmin {
        authorizedDoctors[_doctor] = true;
    }

    function revokeDoctor(address _doctor) public onlyAdmin {
        authorizedDoctors[_doctor] = false;
    }

    function recordDiagnosis(
        uint256 _patientId,
        string[] memory _symptoms,
        string memory _predictionLR,
        string memory _predictionNN,
        uint256 _confidenceNN,
        address _patientAddress
    ) public onlyAuthorizedDoctor {
        require(!hasDiagnosis[_patientId], "Diagnosis already exists");

        Diagnosis memory newDiagnosis = Diagnosis({
            patientId: _patientId,
            symptoms: _symptoms,
            predictionLR: _predictionLR,
            predictionNN: _predictionNN,
            confidenceNN: _confidenceNN,
            recordedBy: msg.sender,
            patientAddress: _patientAddress
        });

        allDiagnoses.push(newDiagnosis);
        patientDiagnoses[_patientId] = newDiagnosis;
        hasDiagnosis[_patientId] = true;

        emit DiagnosisRecorded(_patientId, _predictionLR, _predictionNN, _confidenceNN);
    }

    function getDiagnosis(uint256 _patientId)
        public
        view
        onlyPatientOrDoctor(_patientId)
        returns (
            string memory predictionLR,
            string memory predictionNN,
            uint256 confidenceNN
        )
    {
        Diagnosis memory d = patientDiagnoses[_patientId];
        return (d.predictionLR, d.predictionNN, d.confidenceNN);
    }

    function getSymptoms(uint256 _patientId)
        public
        view
        onlyPatientOrDoctor(_patientId)
        returns (string[] memory)
    {
        return patientDiagnoses[_patientId].symptoms;
    }

    function getDiagnosisCount() public view returns (uint256) {
        return allDiagnoses.length;
    }
}
