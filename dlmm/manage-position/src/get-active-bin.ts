import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import DLMMPool from "@meteora-ag/dlmm";
import "dotenv/config";
import bs58 from "bs58";

const PAYER_PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY;
if (!PAYER_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
}
const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
const payer = Keypair.fromSecretKey(payerSecretKey);

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);



async function getActiveBin() {
  console.log("Fetching active bin information...");

  // Variables to be configured
  const poolAddress = new PublicKey("");

  //

  const dlmmPool = await DLMMPool.create(connection, poolAddress);
  console.log("DLMM pool initialized successfully");

  // Get active bin information
  const activeBin = await dlmmPool.getActiveBin();
  const activeBinPriceLamport = activeBin.price;
  const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    Number(activeBin.price)
  );

  console.log("Active bin ID:", activeBin.binId.toString());
  console.log("Active bin price (per token):", activeBinPricePerToken);

  return {
    activeBin,
    activeBinPriceLamport,
    activeBinPricePerToken,
  };
}

getActiveBin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
