/* eslint-disable no-undef */
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}

contract('EthSwap', (accounts) => {
    let token, ethSwap;
    const initialSupply = tokens('1000000'); // 1 million (with 18 decimal points)

    before(async () => {
        token = await Token.new();
        ethSwap = await EthSwap.new();

        await token.transfer(ethSwap.address, initialSupply);
    })

    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name();
            assert.equal(name, "Eragap Token");
        })
    });

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name();
            assert.equal(name, "EthSwap Exchange");
        })

        it('contract has tokens', async () => {
            const exchangeBalance = await token.balanceOf(ethSwap.address);
            assert.strictEqual(exchangeBalance.toString(), initialSupply);
        })
    });
})