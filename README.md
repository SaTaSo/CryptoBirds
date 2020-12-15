CryptoBirds
===========

A non-fungible token based on `ERC721` standard, begining with 30 tokens which you can buy from the contract. Each token has a unique property called Gene. They can be breeded together creating two more tokens, one for sale and one for the owner of the breeded tokens.

The population in every generation is limited. The first generation has 30 tokens, the second generation has 300 and it goes like this: 240, 180, 120, 60 and then the sixth generation has a population of 30 again. This cycle can be repeated until 65,525 generations.

Owners can transfer and set their token for sale so that new players can buy them.

Install
------

Go to the root of project and do the following:

`npm install` 

`truffle compile`

`truffle test`

`truffle migrate`

And then go to th client folder:

`npm install`

`npm run start`

Enjoy it :D



