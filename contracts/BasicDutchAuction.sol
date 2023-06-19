pragma solidity ^0.8.18;
contract BasicDutchAuction {
    address payable public seller;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public initialPrice;
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 private currentPrice;
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
    
  

  function getCurrentPrice() external view returns (uint256) {
    uint256 blocksPassed = block.number - auctionStartTime;
    if (blocksPassed >= numBlocksAuctionOpen) {
        return reservePrice;
    } else {
        return initialPrice - blocksPassed * offerPriceDecrement;
    }
}



    function bid() external payable {
        require(!auctionEnded, "Auction has already ended");
        if(block.number > auctionEndTime){
        	auctionEnded = true;
        }
        require(block.number <= auctionEndTime, "Auction has exceeded the maximum number of blocks");
        require(msg.value >= initialPrice - (block.number - auctionStartTime + 1)*offerPriceDecrement, "Bid amount is less than the current price");
        seller.transfer(currentPrice);
        auctionEnded = true;


    }
}

