# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```


Optimized ERC20 Token

A simple ERC20 token built using Solidity and OpenZeppelin’s ERC20 implementation.
This contract demonstrates the basic working of minting, burning, and initial token supply creation.

📌 Overview

Token Name: Simple Token

Symbol: SIM

Standard: ERC20

Solidity Version: ^0.8.20

Library Used: OpenZeppelin ERC20

This contract is mainly for learning, testing, and demonstration purposes and is not intended for production use.

⚙️ Features
✅ Initial Supply

Tokens are minted once during deployment.

Entire initial supply is assigned to the deployer.

🔥 Burn Function

Any token holder can burn their own tokens.

Reduces total supply permanently.

🪙 Mint Function

Allows minting tokens to any address.

No access control applied (intentionally kept simple).


⚠️ Important Notes

❌ No access control on mint()
→ Anyone can mint tokens (unsafe for production).

❌ No cap on total supply

❌ Not deployed on Sepolia

✔️ Suitable for learning ERC20 basics
