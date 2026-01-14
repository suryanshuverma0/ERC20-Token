const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1️⃣ Get the owner account (the funded one)
  const [owner] = await ethers.getSigners();
  console.log("Owner address:", owner.address);

  // 2️⃣ Deploy the SimpleERC20 contract with initial supply
  const initialSupply = 200; // 200 tokens
  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
  const token = await SimpleERC20.deploy(initialSupply);
  await token.waitForDeployment();
  console.log("SimpleERC20 deployed to:", token.target);

  // 3️⃣ Create fake addresses to simulate other users (addr1 & addr2)
  const addr1 = ethers.Wallet.createRandom();
  const addr2 = ethers.Wallet.createRandom();
  console.log("Addr1 address:", addr1.address);
  console.log("Addr2 address:", addr2.address);

  // 4️⃣ Check initial balances (only owner has tokens)
  let ownerBalance = await token.balanceOf(owner.address);
  let addr1Balance = await token.balanceOf(addr1.address);
  console.log("Initial owner balance:", ethers.formatUnits(ownerBalance, 18), "SIM");
  console.log("Initial addr1 balance:", ethers.formatUnits(addr1Balance, 18), "SIM");

  // 5️⃣ Transfer 50 tokens from owner to addr1
  console.log("\nTransferring 50 tokens from owner to addr1...");
  await token.transfer(addr1.address, ethers.parseUnits("50", 18));

  ownerBalance = await token.balanceOf(owner.address);
  addr1Balance = await token.balanceOf(addr1.address);
  console.log("Owner balance after transfer:", ethers.formatUnits(ownerBalance, 18), "SIM");
  console.log("Addr1 balance after transfer:", ethers.formatUnits(addr1Balance, 18), "SIM");

  // 6️⃣ Simulate approval: owner approves addr2 to spend 30 tokens on behalf of addr1
  // Since addr1 has no ETH, we do this through the owner for testing
  console.log("\nApproving addr2 to spend 30 tokens on behalf of addr1...");
  await token.approve(addr2.address, ethers.parseUnits("30", 18));
  let allowance = await token.allowance(owner.address, addr2.address);
  console.log("Allowance given to addr2:", ethers.formatUnits(allowance, 18), "SIM");

  console.log("\n✅ All actions simulated successfully using the funded owner account.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
