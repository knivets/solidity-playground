const chai = require("chai");
const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const { parseEther, formatEther } = ethers.utils;

describe("Jokers", function () {
  var jokers;
  var accounts;

  before(async function () {
      let Jokers = await ethers.getContractFactory("Jokers");
      let _jokers = await Jokers.deploy();
      await _jokers.deployed();
      jokers = _jokers;

      accounts = await ethers.getSigners();
  });

  it("Should be able to mint Jokers NFT token with sequential IDs, with respective owners and URIs", async function () {
    let metaURI = "https://example.com/item-id-8u5h2m.json";
    await jokers.mint(accounts[1].address, metaURI);
    await expect(jokers.ownerOf(1)).to.eventually.equal(accounts[1].address);
    await expect(jokers.tokenURI(1)).to.eventually.equal(metaURI);

    let metaURI2 = "https://example.com/item-id-8u5h3m.json";
    await jokers.mint(accounts[2].address, metaURI2);
    await expect(jokers.ownerOf(2)).to.eventually.equal(accounts[2].address);
    await expect(jokers.tokenURI(2)).to.eventually.equal(metaURI2);
  });
});
