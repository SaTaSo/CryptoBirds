// contracts/Stoppable.sol
// author: God will not forgive me for writing this..
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Stoppable is Ownable {

    bool public stopped;

    modifier stoppable() {
        require(!stopped);
        _;
    }

    function stop()
    public onlyOwner returns (bool) 
    {
        stopped = true;
        return stopped;
    }

    function start()
    public onlyOwner returns (bool) 
    {
        stopped = false;
        return stopped;
    }
}