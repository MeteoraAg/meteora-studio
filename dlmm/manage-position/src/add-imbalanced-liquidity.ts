import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import DLMMPool, { autoFillYByStrategy } from "@meteora-ag/dlmm";
import { StrategyType } from "@meteora-ag/dlmm";
import bs58 from "bs58";
import "dotenv/config";

const PAYER_PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY;
if (!PAYER_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
}
const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
const payer = Keypair.fromSecretKey(payerSecretKey);

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);



async function addLiquidity() {

  // Variables to be configured
  const poolAddress = new PublicKey("");
  const existingPositionPubkey = new PublicKey("");
  const XAmount = 1
  const XDecimals = 9
  const YAmount = 100
  const YDecimals = 6
  const minBinId = -5219;
  const maxBinId = -5199;
  const strategyType = StrategyType.Spot // StrategyType.Spot, StrategyType.Imbalance, StrategyType.OneSided

  //

  // Initialise DLMM pool
  const dlmmPool = await DLMMPool.create(connection, poolAddress);
  console.log("DLMM pool initialized successfully");

  // Get active bin information
  console.log("Fetching active bin information...");
  const activeBin = await dlmmPool.getActiveBin();
  console.log("Active bin ID:", activeBin.binId.toString());


  console.log(`Setting bin range: min=${minBinId}, max=${maxBinId}`);

  console.log("Using existing position:", existingPositionPubkey.toBase58());

  try {
    console.log("Adding liquidity...");
    const addLiquidityTx = await dlmmPool.addLiquidityByStrategy({
      positionPubKey: existingPositionPubkey,
      user: payer.publicKey,
      totalXAmount: new BN(XAmount * 10 ** XDecimals),
      totalYAmount: new BN(YAmount * 10 ** YDecimals),
      strategy: {
        maxBinId,
        minBinId,
        strategyType: strategyType,
      },
    });

    // Send and confirm the transaction
    const signature = await connection.sendTransaction(addLiquidityTx, [payer]);
    await connection.confirmTransaction(signature, "confirmed");

    console.log("Liquidity added successfully");
    console.log("Transaction: https://solscan.io/tx/" + signature);
    process.exit(0);
  } catch (error) {
    console.error("Error adding liquidity:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

addLiquidity()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });