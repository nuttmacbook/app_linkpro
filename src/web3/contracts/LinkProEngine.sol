// SPDX-License-Identifier: MIT
pragma solidity 0.8.32;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Constant {
    uint256 constant VERSION = 1000;

    address constant ZERO = address(0);
    address constant DEAD = address(0xdead);
    uint256 constant MAX = type(uint256).max;
    
    IERC20 constant tether = IERC20(0x55d398326f99059fF775485246999027B3197955);
}

contract Storage is Constant {
    address _owner;
    bool _initialized;

    uint256 totalUsers;
    uint256 totalPositions;
    uint256 latestQueue;

    struct User {
        uint256 totalProfit;
        uint256[] pos;
    }

    mapping (address => User) user;

    struct Position {
        uint256 id;
        address account;
        uint256 step;
    }

    mapping (uint256 => Position) pos;
}

contract LinkProEngine is Storage {

    modifier onlyOwner() {
        require(_owner == msg.sender, "Only Owner");
        _;
    }

    function initialize(address owner_) public {
        require(!_initialized);
        _initialized = true;
        _owner = owner_;

        queueNewPosition(owner_);
    }

    function getProxyInfo() public view returns (bool, address, uint256) {
        return (_initialized, _owner, VERSION);
    }

    function getDappInfo() public view returns (uint256, uint256, uint256) {
        return (totalUsers, totalPositions, latestQueue);
    }

    function getUserInfo(address account_) public view returns (User memory, Position[] memory) {
        return (user[account_], getPositionInfo(user[account_].pos));
    }

    function getPositionInfo(uint256[] memory pos_) public view returns (Position[] memory) {
        uint256 len = pos_.length;
        Position[] memory result = new Position[](len);
        for (uint256 i; i < len; i++) { result[i] = pos[pos_[i]]; }
        return result;
    }

    function createPosition(address account_) public payable {
        require(user[account_].pos.length == 0, "This Account Queued");
        tether.transferFrom(msg.sender, address(this), 20e18);
        queueNewPosition(account_);
    }

    function queueNewPosition(address account_) internal returns (uint256) {
        totalPositions++;
        uint256 id = totalPositions;

        pos[id].id = id;
        pos[id].account = account_;

        if (user[account_].pos.length == 0) {
            totalUsers++;
        }

        user[account_].pos.push(id);

        sendProfit();

        return id;
    }

    function sendProfit() internal {

        uint256 toId = latestQueue;
        address recipient = pos[toId].account;

        if (toId == 0) {
            latestQueue++;
            return;
        }

        if (pos[toId].step == 0) {
            tether.transfer(recipient, 16e18);
            tether.transfer(_owner, 4e18);
            user[recipient].totalProfit += 16e18;
            pos[toId].step++;
            return;
        }

        if (pos[toId].step == 1) {
            pos[toId].step++;
            latestQueue++;
            return reinvest(recipient);
        }
    }

    function reinvest(address account_) internal {
        queueNewPosition(account_);
    }

    receive() external payable {}
}