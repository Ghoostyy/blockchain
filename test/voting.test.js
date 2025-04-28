const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Voting", function () {
  let voting;
  let owner, voter1, voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.deployed();
  });

  it("should create a poll", async function () {
    await voting.createPoll("Test Poll", ["Option1", "Option2"], 3000);
    const poll = await voting.polls(0);
    expect(poll.name).to.equal("Test Poll");
  });

  it("should prevent double voting", async function () {
    await voting.createPoll("Poll", ["A", "B"], 3000);
    await voting.connect(voter1).vote(0, 0);
    await expect(
      voting.connect(voter1).vote(0, 1)
    ).to.be.revertedWith("Already voted");
  });

  it("should prevent voting after deadline", async function () {
    await voting.createPoll("Poll", ["A", "B"], 1);
    await network.provider.send("evm_increaseTime", [4000]);
    await network.provider.send("evm_mine");
    await expect(
      voting.connect(voter1).vote(0, 0)
    ).to.be.revertedWith("Poll closed");
  });
});
