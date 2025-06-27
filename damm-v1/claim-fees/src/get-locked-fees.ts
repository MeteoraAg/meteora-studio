import { Connection, PublicKey } from "@solana/web3.js";
import AmmImpl from "@meteora-ag/dynamic-amm-sdk";
import 'dotenv/config';

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);

async function checkPositionFee() {

  //Variables to be configured
  const poolAddress = new PublicKey("");
  const owner = new PublicKey("");

  //

  // init AMM instance
  const amm = await AmmImpl.create(connection as any, poolAddress);
  const tokenADecimals = amm.vaultA.tokenMint.decimals;
  const tokenAAddress = amm.vaultA.tokenMint.address.toString();
  const tokenBDecimals = amm.vaultB.tokenMint.decimals;
  const tokenBAddress = amm.vaultB.tokenMint.address.toString();
  // get user's lock escrow info
  const lockEscrow = await amm.getUserLockEscrow(owner);

  if (!lockEscrow) {
    console.log("No lock escrow found for this user");
    return;
  }

  // check if there are unclaimed fees
  const unclaimedFees = lockEscrow.fee.unClaimed;
  
  if (unclaimedFees.lp.isZero()) {
    console.log("No unclaimed fees available");
    return;
  }
  
  console.log("Unclaimed fees:");
  console.log(`LP tokens: ${unclaimedFees.lp.toNumber() / 10 ** amm.decimals}`);
  console.log(`${tokenAAddress}: ${unclaimedFees.tokenA.toNumber() / 10 ** tokenADecimals}`);
  console.log(`${tokenBAddress}: ${unclaimedFees.tokenB.toNumber() / 10 ** tokenBDecimals}`);
}

checkPositionFee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
