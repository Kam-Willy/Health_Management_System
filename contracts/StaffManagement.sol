// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

abstract contract StaffManagement {
    struct Employee {
        string name;
        string role;
        address wallet;
    }

    mapping(uint256 => Employee) public employees;
    mapping(address => bool) public authorizedStaff;
    uint256 public employeeCounter;

    event StaffAdded(uint256 indexed employeeId, string name, string role, address wallet);

    /// 🛠️ Marked as virtual so it can be overridden in derived contracts
    modifier onlyStaff() virtual {
        require(authorizedStaff[msg.sender], "Not authorized");
        _;
    }

    function isStaff(address account) public view returns (bool) {
        return authorizedStaff[account];
    }

    function _addStaff(address _wallet, string memory _name, string memory _role) internal {
        require(_wallet != address(0), "Invalid wallet");
        employees[employeeCounter] = Employee(_name, _role, _wallet);
        authorizedStaff[_wallet] = true;

        emit StaffAdded(employeeCounter, _name, _role, _wallet);
        employeeCounter++;
    }
}
