const chai = require("chai");
const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const { parseEther, formatEther } = ethers.utils;

describe("Bank", function () {
  var bank;
  var accounts;

  before(async function () {
      let Bank = await ethers.getContractFactory("Bank");
      let _bank = await Bank.deploy();
      await _bank.deployed();
      bank = _bank;

      accounts = await ethers.getSigners();
  });

  it("Owner should be assigned once", async function () {
    // zero on first call
    await expect(bank.owner()).to.eventually.equal('0x0000000000000000000000000000000000000000');

    let setOwnerTx = await bank.setOwner(accounts[2].address);
    await setOwnerTx.wait();

    await expect(bank.owner()).to.eventually.equal(accounts[2].address);

    await expect(bank.setOwner(accounts[1].address)).to.be.rejected;
  });

  it("Should be able to deposit and then withdraw", async function () {
    let bank2 = bank.connect(accounts[1]);
    await expect(accounts[1].getBalance()).to.eventually.equal(parseEther('10000'));

    let depositTx = await bank2.deposit({value: parseEther('1')});
    await depositTx.wait();

    await expect(accounts[1].getBalance()).to.eventually.be.within(parseEther('9998.99'), parseEther('9999'));
    await expect(bank.balances(accounts[1].address)).to.eventually.equal(parseEther('1'));
    await expect(ethers.provider.getBalance(bank.address)).to.eventually.equal(parseEther('1'));

    // accounts[2] can't withdraw because they never deposited
    await expect(bank.connect(accounts[3]).withdraw(parseEther('1'))).to.be.rejected;


    let withdrawTx = await bank2.withdraw(parseEther('1'));
    await withdrawTx.wait();

    await expect(accounts[1].getBalance()).to.eventually.be.within(parseEther('9999.99'), parseEther('10000'));
    await expect(bank.balances(accounts[1].address)).to.eventually.equal(parseEther('0'));
    await expect(ethers.provider.getBalance(bank.address)).to.eventually.equal(parseEther('0'));
  });

  it("Admin account should be able to withdraw everything lol", async function () {
    let bank2 = bank.connect(accounts[1]);
    let depositTx = await bank2.deposit({value: parseEther('1')});
    await depositTx.wait();
    await expect(ethers.provider.getBalance(bank.address)).to.eventually.equal(parseEther('1'));

    let bank3 = bank.connect(accounts[2]);
    await expect(accounts[2].getBalance()).to.eventually.be.equal(parseEther('10000'));
    let withdrawTx = await bank3.withdraw(parseEther('1'));
    await withdrawTx.wait();

    await expect(accounts[2].getBalance()).to.eventually.be.within(parseEther('10000.99'), parseEther('10001'));
    await expect(ethers.provider.getBalance(bank3.address)).to.eventually.equal(parseEther('0'));

    // original depositor can't withdraw
    await expect(bank2.withdraw(parseEther('1'))).to.be.rejected;
    // original depositor doesn't get credited
    await expect(accounts[1].getBalance()).to.eventually.be.within(parseEther('9998.99'), parseEther('9999'));
    // their bank balance is still 1 eth
    await expect(bank.balances(accounts[1].address)).to.eventually.equal(parseEther('1'));
    // bank account doesn't have any eth
    await expect(ethers.provider.getBalance(bank.address)).to.eventually.equal(parseEther('0'));
  });
});
