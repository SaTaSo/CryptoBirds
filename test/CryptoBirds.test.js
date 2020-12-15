let CryptoBirds = artifacts.require('CryptoBirds')

contract('CryptoBirds', function(accounts) {

    const owner = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]

    let instance
    beforeEach(async () => {
        instance = await CryptoBirds.new()
    })

    describe("when owner", async() => {
        it("should be able to stop", async() => {
            await instance.stop({ from: owner })
            const tokenId = 1;
            const bird = await instance.birds.call(tokenId);
            try {
                await instance.buy(tokenId, {
                    from: player1,
                    value: bird.price
                });
            } catch (error) {
                assert(error.message.search("revert") >= 0, "buy should be disabled on stop");
            }
        })

        it("should be able to start", async() => {
            let tokenId = 1;
            const bird = await instance.birds.call(tokenId);
            await instance.buy(tokenId, {
                from: player1,
                value: bird.price
            });

            tokenId = 2
            await instance.buy(tokenId, {
                from: player1,
                value: bird.price
            });

            await instance.stop({ from: owner })
            await instance.start({ from: owner })
            try {
                await instance.breed(1, 2, { from: player1 });
            } catch (error) {
                assert(false, "breed should be possible when not stopped");
            }
        })

        it("should redeem all balance", async() => {
            const tokenId = 1;
            const bird = await instance.birds.call(tokenId);
            await instance.buy(tokenId, {
                from: player1,
                value: bird.price
            });

            const oldBalance = await web3.eth.getBalance(player2);
            await instance.redeemAllBalance(player2, { from: owner })
            const newBalance = await web3.eth.getBalance(player2);
            assert.equal(newBalance - oldBalance, bird.price, 'player2 balance should be increased')
        })
    })

    
    describe("when player", async() => {
        it("should be able to buy", async() => {
            const tokenId = 1;
            const bird = await instance.birds.call(tokenId);
            const tokenOldOwner = await instance.ownerOf.call(tokenId);
            const oldOwnerOldBalance = await web3.eth.getBalance(tokenOldOwner);
            await instance.buy(tokenId, {
                from: player1,
                value: bird.price
            });
            const tokenNewOwner = await instance.ownerOf.call(tokenId);
            assert.equal(tokenNewOwner, player1, 'the token owner should be changed')

            let oldOwnerNewBalance = await web3.eth.getBalance(tokenOldOwner);
            assert.equal(oldOwnerNewBalance - oldOwnerOldBalance, bird.price.toString(), 'old owner balance should be increased')
        })

        it("should be able to breed", async() => {

            let tokenId = 1
            const bird = await instance.birds.call(tokenId);
            await instance.buy(tokenId, {
                from: player1,
                value: bird.price
            });

            tokenId = 2
            await instance.buy(tokenId, {
                from: player1,
                value: bird.price
            });

            const newTokenId = await instance.breed.call(1, 2, { from: player1 });
            await instance.breed(1, 2, { from: player1 });

            const tokenOwner = await instance.ownerOf.call(newTokenId);
            assert.equal(tokenOwner, player1, 'the token owner should be player')

            const newBird = await instance.birds.call(newTokenId);
            assert.equal(newBird.price, 0, 'the token should not be for sale')
            assert.equal(newBird.generation, 1, 'the bird generation should be 1')
        })

        it("should be able to set token for sale", async() => {
            let tokenId = 1
            let bird = await instance.birds.call(tokenId);
            await instance.buy(tokenId, {
                from: player1,
                value: bird.price
            });

            await instance.setForSale(tokenId, 1, { from: player1 });
            bird = await instance.birds.call(tokenId);
            assert.equal(bird.price, 1, 'the token should be for sale')

            try {
                await instance.transferFrom(player1, player2, tokenId, { from: player1 });
            } catch (error) {
                assert(error.message.search("bird can't be for sale") >= 0, "token transfer should be locked when on sale");
            }

        })
    })

});
