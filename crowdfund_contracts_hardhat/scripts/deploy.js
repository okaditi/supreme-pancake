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

// Sepolia
//npx hardhat run scripts/deploy.js --network sepolia
// Deploying CrowdFund contract...
// Deploying with account: 0xaE0CCAC79AfFE82c8d736b1Eaa8351fe9E0f1A23
// CrowdFund deployed to: 0xa2f989C00840fe2878234e1F644CadB936cc37C3
// Network: sepolia
// Waiting for block confirmations...
// Verifying contract on Etherscan...
// Successfully submitted source code for contract
// contracts/CrowdFund.sol:CrowdFund at 0xa2f989C00840fe2878234e1F644CadB936cc37C3
// for verification on the block explorer. Waiting for verification result...
//
// Successfully verified contract CrowdFund on the block explorer.
// https://sepolia.etherscan.io/address/0xa2f989C00840fe2878234e1F644CadB936cc37C3#code
//
// Successfully verified contract CrowdFund on Sourcify.
// https://repo.sourcify.dev/contracts/full_match/11155111/0xa2f989C00840fe2878234e1F644CadB936cc37C3/
//
// ✅ Contract verified successfully!
//
// 🎉 Deployment Complete!
// 📝 Contract Address: 0xa2f989C00840fe2878234e1F644CadB936cc37C3
// 🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/0xa2f989C00840fe2878234e1F644CadB936cc37C3
