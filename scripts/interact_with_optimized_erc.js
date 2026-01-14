const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1. Get signers (wallets)
  const [owner] = await ethers.getSigners();

  const user1 = ethers.Wallet.createRandom().connect(ethers.provider);
  const user2 = ethers.Wallet.createRandom().connect(ethers.provider);
  console.log("Owner:", owner.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);

  // 2. Deployed contract address
  const TOKEN_ADDRESS = "0xF4024c90AD48926f72a6cEDb8A68BE50eB3E8EA2";


  // 3. Get contract instance
  const Token = await ethers.getContractAt(
    "Optimized_ERC20",
    TOKEN_ADDRESS
  );

  // 4. Read basic info
  const name = await Token.name();
  const symbol = await Token.symbol();
  const decimals = await Token.decimals();
  const totalSupply = await Token.totalSupply();

  console.log("\nToken Info:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Decimals:", decimals);
  console.log("Total Supply:", ethers.formatUnits(totalSupply, decimals));

  // 5. Check balances
  const ownerBalance = await Token.balanceOf(owner.address);
  console.log("\nOwner Balance:", ethers.formatUnits(ownerBalance, decimals));

  // 6. Transfer tokens (owner → user1)
  console.log("\nTransferring 50 tokens to User1...");
  const tx1 = await Token.transfer(
    user1.address,
    ethers.parseUnits("50", decimals)
  );
  await tx1.wait();

  const user1Balance = await Token.balanceOf(user1.address);
  console.log("User1 Balance:", ethers.formatUnits(user1Balance, decimals));

  // 7. Approve user2 to spend user1's tokens
  console.log("\nUser1 approves User2 for 20 tokens...");
  const tokenAsUser1 = Token.connect(user1);
  const tx2 = await tokenAsUser1.approve(
    user2.address,
    ethers.parseUnits("20", decimals)
  );
  await tx2.wait();

  const allowance = await Token.allowance(user1.address, user2.address);
  console.log("Allowance User2 has:", ethers.formatUnits(allowance, decimals));

  // 8. transferFrom (user2 spends user1 tokens)
  console.log("\nUser2 transfers 10 tokens from User1 to itself...");
  const tokenAsUser2 = Token.connect(user2);
  const tx3 = await tokenAsUser2.transferFrom(
    user1.address,
    user2.address,
    ethers.parseUnits("10", decimals)
  );
  await tx3.wait();

  console.log("User1 Balance:", ethers.formatUnits(
    await Token.balanceOf(user1.address),
    decimals
  ));
  console.log("User2 Balance:", ethers.formatUnits(
    await Token.balanceOf(user2.address),
    decimals
  ));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
