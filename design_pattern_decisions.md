Circuit Breaker
---------------

As requested in the final project description file this design pattern has was implemented in `Stoppable.sol` and used in `CryptoBirds.sol`.

All mission critical functions like `breed`, `buy`, `setForSale` and `_transfer` will be halted after the owner of the main contract chooses to stop it.

Restricting Access
------------------

Using the `Ownable` contract in OpenZeppelin library, the main contract is restricting the function `redeemAllBalance` to be only accessible to owner (deployer) of the contract.
More over, there are many other function that are using the `internal` modifiier which would be only accissble only within the contract and can not be called after deployment directly by a user.