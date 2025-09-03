// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract CrowdFund {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    uint256 public numberOfCampaigns = 0;
    mapping(uint256 => Campaign) public campaigns;

    fallback() external payable {
        donateToCampaign(numberOfCampaigns);
    }

    receive() external payable {
        donateToCampaign(numberOfCampaigns);
    }

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future.");

        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Campaign does not exist.");
        require(msg.value > 0, "Donation must be greater than zero.");
        require(block.timestamp < campaigns[_id].deadline, "Campaign has ended.");
        require(campaigns[_id].amountCollected < campaigns[_id].target, "Campaign has already reached its target.");

        uint256 amount = msg.value;
        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent,) = payable(campaign.owner).call{value: amount}("");
        if (!sent) {
            campaign.donators.pop();
            campaign.donations.pop();
        }

        require(sent, "Transfer failed.");

        campaign.amountCollected += amount;
    }

    function getDonators(uint256 _id) public view returns (address[] memory) {
        return campaigns[_id].donators;
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    function getCampaign(uint256 _id) public view returns (Campaign memory) {
        return campaigns[_id];
    }
}
