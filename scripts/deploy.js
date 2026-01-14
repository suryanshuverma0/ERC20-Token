const hre = require("hardhat");

async function main() {
  const initialSupply = 200; // initial tokens

  const Optimized_ERC20 = await hre.ethers.getContractFactory("Optimized_ERC20");
  const token = await Optimized_ERC20.deploy(initialSupply);

 await token.waitForDeployment();

  console.log("Optimized_ERC20 deployed to:", token.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
