Re-entracy Attack
------------------

There is this function called `buy` in the main contract that would receive funds and forward it to the previous owner of the token and transfers the token to the new owner.

This function is subject to re-entrancy attack and the mitigation is to put the transfer part at the end of the process so that in case of re-entrance the states of the contract is updated thus mitigating the attack.

Integer Overflow and Underflow
------------------------------

In the process of `breed` function, variable `generation` which has a size of `uint16` can be overflowed. To mitigate this a check has been added so that in case of overflow the transaction would be reverted.