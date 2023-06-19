// Import the necessary modules and libraries for testing
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("BasicDutchAuction", function () {
  let basicDutchAuction;
  let seller;
  let bidder1;
  let bidder2;

  beforeEach(async function () {
    // Deploy the BasicDutchAuction contract
    const BasicDutchAuction = await ethers.getContractFactory("BasicDutchAuction");
    [seller, bidder1, bidder2] = await ethers.getSigners();

    
    
    basicDutchAuction = await BasicDutchAuction.deploy(
      ethers.utils.parseEther("1"),  // Reserve price: 1 ether
      10,  // Number of blocks auction open: 10
      ethers.utils.parseEther("0.1")  // Offer price decrement: 0.1 ether
    );
    await basicDutchAuction.deployed();
    
    await ethers.provider.send("hardhat_setBalance", [
      	seller.address,
      	ethers.utils.hexlify(ethers.utils.parseEther("10")), // Set the desired initial balance here
    ]);
    
    await ethers.provider.send("hardhat_setBalance", [
      	bidder1.address,
      	ethers.utils.hexlify(ethers.utils.parseEther("10")), // Set the desired initial balance here
    ]);
    
    await ethers.provider.send("hardhat_setBalance", [
      	bidder2.address,
      	ethers.utils.hexlify(ethers.utils.parseEther("10")), // Set the desired initial balance here
    ]);
  });

  it("should initialize the contract correctly", async function () {
    expect(await basicDutchAuction.seller()).to.equal(seller.address);
    expect(await basicDutchAuction.reservePrice()).to.equal(ethers.utils.parseEther("1"));
    expect(await basicDutchAuction.numBlocksAuctionOpen()).to.equal(10);
    expect(await ethers.provider.getBalance(seller.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder1.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder2.address)).to.equal(ethers.utils.parseEther("10"));
    
    expect(await  basicDutchAuction.offerPriceDecrement()).to.equal(ethers.utils.parseEther("0.1"));

    const auctionStartTime = await basicDutchAuction.auctionStartTime();
    const auctionEndTime = await basicDutchAuction.auctionEndTime();
    expect(auctionEndTime.sub(auctionStartTime)).to.equal(10);
    
    const initialPrice = await basicDutchAuction.initialPrice();
    expect(initialPrice).to.equal(ethers.utils.parseEther("1.9"));

    expect(await basicDutchAuction.getCurrentPrice()).to.equal(ethers.utils.parseEther("1.9"));
    expect(await basicDutchAuction.auctionEnded()).to.equal(false);
  });

it("should allow a bid greater than or equal to the current price", async function () {
  // Bidder1 submits a bid equal to the current price
  expect(await ethers.provider.getBalance(seller.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder1.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder2.address)).to.equal(ethers.utils.parseEther("10"));
  await basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("1.9") });
  expect(await basicDutchAuction.auctionEnded()).to.equal(true);

  // Bidder2 tries to submit a bid less than the current price
  await expect(basicDutchAuction.connect(bidder2).bid({ value: ethers.utils.parseEther("1.8") }))
    .to.be.revertedWith("Auction has already ended");
});


  it("should refund non-winning bids", async function () {
  expect(await ethers.provider.getBalance(seller.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder1.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder2.address)).to.equal(ethers.utils.parseEther("10"));
    await expect(basicDutchAuction.connect(bidder2).bid({ value: ethers.utils.parseEther("1.0") }))
      .to.be.revertedWith("Bid amount is less than the current price");
    // Bidder1 submits a bid equal to the current price and becomes the winner
    await basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("1.9") });
    expect(await basicDutchAuction.auctionEnded()).to.equal(true);
    //expect(await ethers.provider.getBalance(bidder1.address)).to.equal(ethers.utils.parseEther("8.1"));
    // Bidder2 submits a bid greater than the current price
    await expect(basicDutchAuction.connect(bidder2).bid({ value: ethers.utils.parseEther("2.0") }))
      .to.be.revertedWith("Auction has already ended");

    // Refund non-winning bid (bidder2)
    // await basicDutchAuction.connect(bidder2).refund();

    // Check the refund
//    const bidder2Balance = await ethers.provider.getBalance(bidder2.address);
    expect(await ethers.provider.getBalance(seller.address)).to.equal(ethers.utils.parseEther("11.9"));
  });
  
  it("should allow bidding within the auction duration", async function () {
  // Bidder1 submits a bid equal to the current price
  expect(await ethers.provider.getBalance(seller.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder1.address)).to.equal(ethers.utils.parseEther("10"));
    expect(await ethers.provider.getBalance(bidder2.address)).to.equal(ethers.utils.parseEther("10"));
  await basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("1.9") });
  expect(await basicDutchAuction.auctionEnded()).to.equal(true);

  // Bidder2 tries to submit a bid less than the current price
  await expect(basicDutchAuction.connect(bidder2).bid({ value: ethers.utils.parseEther("1.8") }))
    .to.be.revertedWith("Auction has already ended");
});
it("Exceeded the maximum number of blocks", async()=>{
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Bid amount is less than the current price");
	await expect(basicDutchAuction.connect(bidder1).bid({ value: ethers.utils.parseEther("0") })).to.be.revertedWith("Auction has exceeded the maximum number of blocks");
	expect(await basicDutchAuction.getCurrentPrice()).to.equal(ethers.utils.parseEther("1.0"));
	
	
});



});
