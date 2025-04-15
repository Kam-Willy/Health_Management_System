// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./PatientManagement.sol";
import "./Billing.sol";
import "./StaffManagement.sol";

contract HospitalManagement is ERC721URIStorage, Ownable, ReentrancyGuard, PatientManagement, Billing, StaffManagement {
    modifier onlyStaff() override(PatientManagement, StaffManagement, Billing) {
        require(isStaff(msg.sender), "Caller is not staff");
        _;
    }
    using Strings for uint256;

    uint256 public bedCounter;
    bool private locked;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        bedCounter = 100;
        patientCounter = 1;
        employeeCounter = 1;
    }

    modifier customNonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function addStaff(address wallet, string memory name, string memory role) public onlyOwner {
        _addStaff(wallet, name, role);
    }

    function admitPatient(address wallet, string memory name, uint8 age, uint16 bedId) public onlyStaff {
        _admitPatient(wallet, name, age, bedId);
        uint256 tokenId = patientCounter - 1;

        _mint(wallet, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("https://hospital-med-nft.io/metadata/", tokenId.toString(), ".json")));
    }

    function addBillItem(uint256 patientId, string memory desc, uint256 cost) public onlyStaff {
        _addBillItem(patientId, desc, cost);
    }

    function payBill(uint256 patientId) public payable customNonReentrant {
        require(msg.sender == patients[patientId].wallet, "Not payer");
        uint256 total = _getBillTotal(patientId);
        require(msg.value >= total, "Underpaid");

        if (msg.value > total) {
            payable(msg.sender).transfer(msg.value - total);
        }

        _markPaid(patientId);
        emit PaymentProcessed(patientId);
    }

    function dischargePatient(uint256 patientId) public onlyStaff {
        _dischargePatient(patientId);
    }

    function recordDiagnosis(uint256 patientId, string memory diagnosis, uint8 confidence) public onlyStaff {
        _recordDiagnosis(patientId, diagnosis, confidence);
    }

    // Internal override hooks
    function _incrementBill(uint256 patientId, uint256 amount) internal override {
        patients[patientId].bill += amount;
    }

    function _markPaid(uint256 patientId) internal override {
        patients[patientId].paid = true;
    }

    receive() external payable {
        revert("Direct Ether transfers not allowed");
    }
}
