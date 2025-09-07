import hre from "hardhat";

async function main() {
  console.log("Deploying CrowdFund contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const CrowdFund = await hre.ethers.getContractFactory("CrowdFund");
  const crowdFund = await CrowdFund.deploy();

  await crowdFund.waitForDeployment();
  const contractAddress = await crowdFund.getAddress();

  console.log("CrowdFund deployed to:", contractAddress);
  console.log("Network:", hre.network.name);

  // Wait for block confirmations on testnet
  if (hre.network.name === "sepolia") {
    console.log("Waiting for block confirmations...");
    const deploymentTx = crowdFund.deploymentTransaction();
    if (deploymentTx) {
      await deploymentTx.wait(6);
    }

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log("❌ Verification failed:", error.message);
      }
    }
  }

  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment Complete!`);
    console.log(`📝 Contract Address: ${address}`);
    if (hre.network.name === "sepolia") {
      console.log(
        `🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/${address}`
      );
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/deploy.js --network sepolia
// Deploying CrowdFund contract...
// Deploying with account: 0x435800000093FCD40000D02d961b80006911f792
// CrowdFund deployed to: 0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179
// Network: sepolia
// Waiting for block confirmations...
// Verifying contract on Etherscan...
// The contract 0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179 has already been verified on the block explorer. If you're trying to verify a partially verified contract, please use the --force flag.
// https://sepolia.etherscan.io/address/0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179#code

// The contract 0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179 has already been verified on Sourcify.
// https://repo.sourcify.dev/contracts/full_match/11155111/0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179/

// ✅ Contract verified successfully!

// 🎉 Deployment Complete!
// 📝 Contract Address: 0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179
// 🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179
