pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Exchange";
    Token public token;
    uint256 public redemptionRate = 100;

    // redemptionRate = no. of eragap tokens we receive for 1 ether (1eth = 100 Eragap token)

    constructor(Token _token) public {
        token = _token;
    }

    event TokenPurchased(
        address account, //one who purchased the token
        address token, // token's address (where smart contract for the token resides)
        uint256 amount,
        uint256 rate
    );

    function buyTokens() public payable {
        // calculate number of tokens to buy
        uint256 tokenPurchaseAmount = msg.value * redemptionRate;

        //verfiy that exchange has the required amount of tokens
        require(token.balanceOf(address(this)) >= tokenPurchaseAmount);

        // transfer tokens
        token.transfer(msg.sender, tokenPurchaseAmount);

        // emit the event
        emit TokenPurchased(
            msg.sender,
            address(token),
            tokenPurchaseAmount,
            redemptionRate
        );
    }
}
