// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

abstract contract Billing {
    struct BillItem {
        string description;
        uint256 cost;
    }

    mapping(uint256 => BillItem[]) public patientBills;

    event BillItemAdded(uint256 indexed patientId, string description, uint256 cost);
    event PaymentProcessed(uint256 indexed patientId);

    modifier onlyStaff() virtual;

    function _addBillItem(uint256 patientId, string memory desc, uint256 cost) internal {
        require(cost > 0, "Cost must be positive");
        require(bytes(desc).length > 0, "Description required");

        patientBills[patientId].push(BillItem(desc, cost));
        _incrementBill(patientId, cost);

        emit BillItemAdded(patientId, desc, cost);
    }

    function _getBillTotal(uint256 patientId) internal view returns (uint256 total) {
        BillItem[] memory bills = patientBills[patientId];
        for (uint i = 0; i < bills.length; i++) {
            total += bills[i].cost;
        }
    }

    function _incrementBill(uint256 patientId, uint256 amount) internal virtual;

    function _markPaid(uint256 patientId) internal virtual;
}
