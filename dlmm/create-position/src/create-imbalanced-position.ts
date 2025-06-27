import { BN } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import DLMMPool, { StrategyType } from "@meteora-ag/dlmm";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import 'dotenv/config';

const PAYER_PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY;
if (!PAYER_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
}
const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
const payer = Keypair.fromSecretKey(payerSecretKey);

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);




async function createImbalancePosition() {

  // Variables to be configured
  const poolAddress = new PublicKey("5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"); 
  // Example of creating a position on a SOL-USDC pool with 0.1 SOL and 100 USDC
  const XAmount = 0.1
  const YAmount = 100
  const XDecimals = 9
  const YDecimals = 6
  const totalRangeInterval = 10; // 10 bins on each side of the active bin
  const strategyType = StrategyType.Spot // StrategyType.Spot, StrategyType.Curve, StrategyType.BidAsk


  //

  const dlmmPool = await DLMMPool.create(connection, poolAddress);
  console.log("DLMM pool initialized successfully");

  // Get active bin information
  console.log("Fetching active bin information...");
  const activeBin = await dlmmPool.getActiveBin();
  console.log("Active bin ID:", activeBin.binId.toString());

  // Calculate bin range
  const minBinId = activeBin.binId - totalRangeInterval;
  const maxBinId = activeBin.binId + totalRangeInterval;
  console.log(`Setting bin range: min=${minBinId}, max=${maxBinId}`);

  // Create new position keypair
  const newImbalancePosition = new Keypair();
  console.log(
    "Created new position keypair:",
    newImbalancePosition.publicKey.toBase58()
  );

  try {
    console.log("Preparing to create position and add liquidity...");
    // Create position
    const createPositionTx =
      await dlmmPool.initializePositionAndAddLiquidityByStrategy({
        positionPubKey: newImbalancePosition.publicKey,
        user: payer.publicKey,
        totalXAmount: new BN(XAmount * 10 ** XDecimals),
        totalYAmount: new BN(YAmount * 10 ** YDecimals),
        strategy: {
          maxBinId,
          minBinId,
          strategyType
        },
      });
    console.log("Transaction prepared, sending to network...");

    // Send transaction
    const signature = await connection.sendTransaction(
      createPositionTx,
      [payer, newImbalancePosition],
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    console.log("\nTransaction sent successfully!");
    console.log("Transaction: https://solscan.io/tx/" + signature);
    console.log("Position address:", newImbalancePosition.publicKey.toBase58());
    process.exit(0);
  } catch (error) {
    console.error("Error creating imbalance position:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

createImbalancePosition()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
