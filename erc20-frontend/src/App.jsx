import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { CONTRACT_ADDRESS, TOKEN_ABI } from "./constants";
const SEPOLIA_CHAIN_ID = 11155111n;
const abi = TOKEN_ABI;
const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx/";

export default function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [balance, setBalance] = useState("0");

  // owner → spender
  const [spender, setSpender] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [allowance, setAllowance] = useState("0");

  // spender → transferFrom
  const [owner, setOwner] = useState("");
  const [recipient, setRecipient] = useState("");
  const [spendAmount, setSpendAmount] = useState("");

  // direct transfer (self)
  const [to, setTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // ---------------- CONNECT ----------------
  const connectWallet = async () => {
    const _provider = new ethers.BrowserProvider(window.ethereum);
    const _signer = await _provider.getSigner();
    const _account = await _signer.getAddress();
    const _contract = new ethers.Contract(CONTRACT_ADDRESS, abi, _signer);

    setProvider(_provider);
    setSigner(_signer);
    setAccount(_account);
    setContract(_contract);

    toast.success("Wallet connected");

    const network = await _provider.getNetwork();

    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      toast.error("Please switch to Sepolia network");
    }
  };

  // ---------------- LOAD TOKEN ----------------
  const loadToken = async () => {
    if (!contract || !account) return;

    const [n, s, d, b] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(account),
    ]);

    setName(n);
    setSymbol(s);
    setDecimals(d);
    setBalance(ethers.formatUnits(b, d));
  };

  // ---------------- APPROVE ----------------
  const approve = async () => {
    try {
      const value = ethers.parseUnits(approveAmount, decimals);
      const gas = await contract.approve.estimateGas(spender, value);

      const tx = await contract.approve(spender, value, { gasLimit: gas });
      toast.loading("Approving...");

      await tx.wait();
      toast.success("Approved");

      loadAllowance();
    } catch (e) {
      toast.error(e.reason || "Approve failed");
    }
  };

  // ---------------- ALLOWANCE ----------------
  const loadAllowance = async () => {
    const a = await contract.allowance(account, spender);
    setAllowance(ethers.formatUnits(a, decimals));
  };

  // ---------------- TRANSFER FROM (SPENDER) ----------------
  const transferFromOwner = async () => {
    try {
      const value = ethers.parseUnits(spendAmount, decimals);

      // pre-checks (REAL apps do this)
      const ownerBalance = await contract.balanceOf(owner);
      if (ownerBalance < value) {
        toast.error("Owner balance too low");
        return;
      }

      const allowed = await contract.allowance(owner, account);
      if (allowed < value) {
        toast.error("Allowance too low");
        return;
      }

      const gas = await contract.transferFrom.estimateGas(
        owner,
        recipient,
        value
      );

      const tx = await contract.transferFrom(owner, recipient, value, {
        gasLimit: gas,
      });

      toast.promise(tx.wait(), {
        loading: "Spending allowance...",
        success: "Allowance spent",
        error: "transferFrom failed",
      });

      toast.success(
        <a href={SEPOLIA_EXPLORER + tx.hash} target="_blank">
          View on Etherscan
        </a>
      );

      loadToken();
      loadAllowance();
    } catch (e) {
      toast.error(e.reason || "transferFrom failed");
    }
  };

  // ---------------- DIRECT TRANSFER ----------------
  const transfer = async () => {
    try {
      const value = ethers.parseUnits(transferAmount, decimals);

      const gas = await contract.transfer.estimateGas(to, value);

      const tx = await contract.transfer(to, value, { gasLimit: gas });

      toast.promise(tx.wait(), {
        loading: "Transferring tokens...",
        success: "Transfer successful",
        error: "Transfer failed",
      });

      toast.success(
        <a href={SEPOLIA_EXPLORER + tx.hash} target="_blank">
          View on Etherscan
        </a>
      );

      loadToken();
    } catch (e) {
      toast.error(e.reason || "Transfer failed");
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    loadToken();
  }, [contract, account]);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <Toaster position="top-right" />

      <div className="w-full max-w-xl bg-gray-900 p-6 rounded-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {name || "ERC-20 Dashboard"}
        </h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-indigo-600 py-2 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="text-xs break-all">{account}</div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Symbol" value={symbol} />
              <Stat label="Balance" value={balance} />
              <Stat label="Decimals" value={decimals} />
            </div>

            {/* OWNER SIDE */}
            <Section title="Approve (Owner)">
              <Input placeholder="Spender address" set={setSpender} />
              <Input placeholder="Amount" set={setApproveAmount} />
              <Button onClick={approve}>Approve</Button>

              <button
                className="text-xs text-indigo-400"
                onClick={loadAllowance}
              >
                Check Allowance
              </button>

              <div className="text-sm">Allowance: {allowance}</div>
            </Section>

            {/* SPENDER SIDE */}
            <Section title="Spend Allowance (Spender)">
              <Input placeholder="Owner address" set={setOwner} />
              <Input placeholder="Recipient address" set={setRecipient} />
              <Input placeholder="Amount" set={setSpendAmount} />
              <Button onClick={transferFromOwner}>transferFrom</Button>
            </Section>

            {/* DIRECT TRANSFER */}
            <Section title="Transfer Tokens">
              <Input placeholder="Recipient address" set={setTo} />
              <Input placeholder="Amount" set={setTransferAmount} />
              <Button onClick={transfer}>Transfer</Button>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------- SMALL COMPONENTS ----------------
function Input({ placeholder, set }) {
  return (
    <input
      className="w-full bg-gray-800 px-3 py-2 rounded"
      placeholder={placeholder}
      onChange={(e) => set(e.target.value)}
    />
  );
}

function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="w-full bg-green-600 py-2 rounded">
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="border border-gray-700 p-4 rounded space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-800 p-3 rounded">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
