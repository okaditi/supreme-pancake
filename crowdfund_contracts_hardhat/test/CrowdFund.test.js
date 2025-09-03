const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFund", function () {
  let crowdFund;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CrowdFund = await ethers.getContractFactory("CrowdFund");
    crowdFund = await CrowdFund.deploy();
    await crowdFund.waitForDeployment();
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour 

      await crowdFund.createCampaign(
        owner.address,
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1"),
        futureTime,
        "test-image.jpg"
      );

      expect(await crowdFund.numberOfCampaigns()).to.equal(1);

      const campaign = await crowdFund.getCampaign(0);
      expect(campaign.title).to.equal("Test Campaign");
      expect(campaign.target).to.equal(ethers.parseEther("1"));
    });

    it("Should fail with past deadline", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      await expect(
        crowdFund.createCampaign(
          owner.address,
          "Test Campaign",
          "Test Description",
          ethers.parseEther("1"),
          pastTime,
          "test-image.jpg"
        )
      ).to.be.revertedWith("Deadline must be in the future.");
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      await crowdFund.createCampaign(
        addr1.address,
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1"),
        futureTime,
        "test-image.jpg"
      );
    });

    it("Should accept donations", async function () {
      const donationAmount = ethers.parseEther("0.1");

      await expect(() =>
        crowdFund.connect(addr2).donateToCampaign(0, { value: donationAmount })
      ).to.changeEtherBalances(
        [addr2, addr1],
        [-donationAmount, donationAmount]
      );

      const campaign = await crowdFund.getCampaign(0);
      expect(campaign.amountCollected).to.equal(donationAmount);
    });
  });
});