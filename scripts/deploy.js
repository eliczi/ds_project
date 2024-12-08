// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      "gets automatically created and destroyed every time. Use the Hardhat" +
      " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners(); //Returns a list of accounts (signers) available for deploying contracts. Typically, the first account is used as the deployer.

  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());


  //Compiles and deploys the Crowdfund smart contract.
  const RentalMarketPlace = await ethers.getContractFactory("RentalMarketplace");
  const rentalMarketPlace = await RentalMarketPlace.deploy();
  await rentalMarketPlace.deployed();

  console.log("RentalMarketplace Contract address:",rentalMarketPlace.address);

  // We also save the contract's artifacts and address in the frontend directory
  //Calls a helper function to save the contract's address and ABI to the frontend directory.
  saveFrontendFiles(rentalMarketPlace);
}

function saveFrontendFiles(rentalMarketPlace) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ RentalMarketplace: rentalMarketPlace.address }, undefined, 2)
  );

  const RentalMarketplaceArtifact = artifacts.readArtifactSync("RentalMarketplace");

  fs.writeFileSync(
    path.join(contractsDir, "RentalMarketplace.json"),
    JSON.stringify(RentalMarketplaceArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
