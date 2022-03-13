const chai = require("chai");
const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const { parseEther, formatEther } = ethers.utils;

describe("Cats", function () {
  const baseURI = 'https://knivets.com/cats-nft/';

  var cats;
  var accounts;

  before(async function () {
      let Cats = await ethers.getContractFactory("Cats");
      let _cats = await Cats.deploy();
      await _cats.deployed();
      cats = _cats;

      accounts = await ethers.getSigners();
  });

  // pausing, burning?

  it("should be mintable", async function () {
    let id = 0;
    await cats.mint(accounts[0].address);
    await expect(cats.ownerOf(id)).to.eventually.equal(accounts[0].address);
    await expect(cats.tokenURI(id)).to.eventually.equal(baseURI + id + '.json');

    id = 1;
    await cats.mint(accounts[1].address);
    await expect(cats.ownerOf(id)).to.eventually.equal(accounts[1].address);
    await expect(cats.tokenURI(id)).to.eventually.equal(baseURI + id + '.json');
  });

  it("should be mintable only by deploying account", async function () {
    await expect(cats.connect(accounts[1]).mint(accounts[1].address)).to.be.rejected;
  });

  it("should be pausable", async function () {
    await cats.pause();
    await expect(cats.mint(accounts[0].address)).to.be.rejected;

    await cats.unpause();
    await cats.mint(accounts[0].address);
    await expect(cats.ownerOf(2)).to.eventually.equal(accounts[0].address);
  });

  it("should be burnable", async function () {
    let id = 3
    await cats.mint(accounts[0].address);
    await expect(cats.ownerOf(id)).to.eventually.equal(accounts[0].address);
    await cats.burn(id);
    await expect(cats.ownerOf(id)).to.be.rejected;

    await cats.mint(accounts[0].address);
    await expect(cats.ownerOf(4)).to.eventually.equal(accounts[0].address);
  });
});
