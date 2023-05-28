pragma solidity ^0.8.18;
contract BasicDutchAuction {
    address payable public seller;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public initialPrice;
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 public currentPrice;
    bool public auctionEnded;

    event RefundInfo(address indexed bidder, uint256 refundAmount, uint256 contractBalance);

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        seller = payable(msg.sender);
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

        auctionStartTime = block.number;
        auctionEndTime = auctionStartTime + numBlocksAuctionOpen;

        initialPrice = reservePrice + (numBlocksAuctionOpen - 1) * offerPriceDecrement;
        currentPrice = initialPrice;
        auctionEnded = false;
    }

    function bid() external payable {
        require(!auctionEnded, "Auction has already ended");
        require(msg.value >= currentPrice, "Bid amount is less than the current price");

        seller.transfer(currentPrice);
        auctionEnded = true;
    }
}

