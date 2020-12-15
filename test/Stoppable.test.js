let Stoppable = artifacts.require('Stoppable')

contract('Stoppable', function(accounts) {

    const owner = accounts[0]
    const user = accounts[1]

    let instance
    beforeEach(async () => {
        instance = await Stoppable.new()
    })

    describe("when owner", async() => {
        it("should be able to stop", async() => {
            await instance.stop({ from: owner })
            const stopped = await instance.stopped.call()
            assert.equal(stopped, true, 'the stopped variable should be true')
        })

        it("should be able to start", async() => {
            await instance.stop({ from: owner })
            await instance.start({ from: owner })
            const stopped = await instance.stopped.call()
            assert.equal(stopped, false, 'the stopped variable should be false')
        })
    })

    
    describe("when user", async() => {
        it("should not be able to stop", async() => {
            try {
                await instance.stop({ from: user })
            } catch (error) {
                assert(error.message.search("revert") >= 0, "only owner should be able to stop");
            }
        })

        it("should not be able to start", async() => {
            await instance.stop({ from: owner })
            try {
                await instance.start({ from: user })
            } catch (error) {
                assert(error.message.search("revert") >= 0, "only owner should be able to start");
            }
        })

    })

});
