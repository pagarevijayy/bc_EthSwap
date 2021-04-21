/* eslint-disable no-undef */
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokenWeiconverted(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap;
    const initialSupply = tokenWeiconverted('1000000'); // 1 million (with 18 decimal points)

    before(async () => {
        token = await Token.new();
        ethSwap = await EthSwap.new(token.address);

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

    describe('buyTokens', async () => {
        let result;
        before(async () => {
            // purchase tokens before each example 
            const etherSent = tokenWeiconverted('1');
            result = await ethSwap.buyTokens({ from: investor, value: etherSent });
        })

        it('allows user to purschase token at a fixed price', async () => {
            // check investor TOKEN balance after purchase (should be increased)
            const investorBalance = await token.balanceOf(investor);
            assert.strictEqual(investorBalance.toString(), tokenWeiconverted('100'))

            // check EthSwap TOKEN balance after purchase (should be reduced)
            const ethSwapTokenBalance = await token.balanceOf(ethSwap.address);
            assert.strictEqual(ethSwapTokenBalance.toString(), tokenWeiconverted('999900'))

            // check EthSwap ETHER balance after purchase (should be increased)
            const ethSwapEthereumBalance = await web3.eth.getBalance(ethSwap.address)
            assert.strictEqual(ethSwapEthereumBalance.toString(), tokenWeiconverted('1'))

            // check if the event is emitted properly
            const event = result.logs[0].args;

            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokenWeiconverted('100'))
            assert.equal(event.rate.toString(), '100')
        })
    });
})