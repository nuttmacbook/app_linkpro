// SPDX-License-Identifier: MIT
pragma solidity 0.8.32;

contract LinkProProxy {
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    bytes32 private constant _ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    event Upgraded(address indexed newImplementation);
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == _admin(), "Not admin");
        _;
    }

    constructor(address _impl, bytes memory _data) payable {
        require(_impl.code.length > 0, "Not contract");
        _setAdmin(msg.sender);
        _setImplementation(_impl);

        if (_data.length > 0) {
            (bool ok, bytes memory ret) = _impl.delegatecall(_data);
            if (!ok) assembly { revert(add(ret, 0x20), mload(ret)) }
        }
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero admin");
        emit AdminChanged(_admin(), newAdmin);
        _setAdmin(newAdmin);
    }

    function upgradeTo(address _impl) external onlyAdmin {
        require(_impl.code.length > 0, "Not contract");
        _setImplementation(_impl);
        emit Upgraded(_impl);
    }

    function upgradeToAndCall(address _impl, bytes memory _data) external onlyAdmin {
        require(_impl.code.length > 0, "Not contract");
        _setImplementation(_impl);
        emit Upgraded(_impl);

        if (_data.length > 0) {
            (bool ok, bytes memory ret) = _impl.delegatecall(_data);
            if (!ok) assembly { revert(add(ret, 0x20), mload(ret)) }
        }
    }

    function adminCall(address to, bytes memory data, uint256 value) external onlyAdmin {
        (bool ok,) = to.call{ value: value }(data);
        require(ok);
    }

    function admin() external view returns (address) { return _admin(); }
    function implementation() external view returns (address) { return _implementation(); }

    fallback() external payable { _delegate(); }
    receive() external payable { _delegate(); }

    function _delegate() internal {
        address impl = _implementation();
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    function _implementation() private view returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly { impl := sload(slot) }
    }

    function _admin() private view returns (address adm) {
        bytes32 slot = _ADMIN_SLOT;
        assembly { adm := sload(slot) }
    }

    function _setImplementation(address impl) private {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly { sstore(slot, impl) }
    }

    function _setAdmin(address adm) private {
        bytes32 slot = _ADMIN_SLOT;
        assembly { sstore(slot, adm) }
    }
}