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

    event TokensPurchased(
        address account, //one who purchased the token
        address token, // token's address (where smart contract for the token resides)
        uint256 amount,
        uint256 rate
    );

    event TokensSold(
        address account, //one who sold the token
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
        emit TokensPurchased(
            msg.sender,
            address(token),
            tokenPurchaseAmount,
            redemptionRate
        );
    }

    function sellTokens(uint256 _tokenAamount) public {
        // verfiy that the seller has the required amount of tokens
        require(token.balanceOf(msg.sender) >= _tokenAamount);

        // ether to be redeemed
        uint256 etherAmount = _tokenAamount / redemptionRate;

        // verify ethswap has enough ether
        require(address(this).balance >= etherAmount);

        // perform sale
        token.transferFrom(msg.sender, address(this), _tokenAamount); // user spends token
        msg.sender.transfer(etherAmount); // user receives ether

        // emit the event
        emit TokensSold(
            msg.sender,
            address(token),
            _tokenAamount,
            redemptionRate
        );
    }
}
