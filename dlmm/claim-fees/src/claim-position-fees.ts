import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import DLMMPool, { LbPosition, PositionVersion } from "@meteora-ag/dlmm";
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



async function createBalancePosition() {
  // Variables to be configured
  const poolAddress = new PublicKey("");
  const positionAddress = new PublicKey("");

  //
  
  try {
    
    const dlmmPool = await DLMMPool.create(connection, poolAddress);
    const userPositions = await dlmmPool.getPositionsByUserAndLbPair(payer.publicKey);
    const userPosition = userPositions.userPositions.find(({ publicKey }) =>
        publicKey.equals(positionAddress)
    );
    if (!userPosition) {
        throw new Error("Position not found");
    }

    const lbPosition: LbPosition = {
        publicKey: positionAddress,
        positionData: userPosition.positionData,
        version: userPosition.version
    };
      
    const claimSwapFeeTx = await dlmmPool.claimSwapFee({
      owner: payer.publicKey,
      position: lbPosition,
    })

    const tx = await sendAndConfirmTransaction(connection, claimSwapFeeTx!, [payer]);
    console.log("Transaction:", tx);
    console.log("Transaction: https://solscan.io/tx/" + tx);
  } catch (error) {
    console.error("Error:", error);
  }
}

createBalancePosition()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });