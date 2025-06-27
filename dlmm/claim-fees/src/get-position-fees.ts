import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import DLMMPool from "@meteora-ag/dlmm";
import bs58 from "bs58";
import "dotenv/config";


const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);



async function getPositionFees() {
  // Variables to be configured
  const poolAddress = new PublicKey("");
  const positionAddress = new PublicKey("");
  const ownerPublicKey = new PublicKey("");

  try {
    
    const dlmmPool = await DLMMPool.create(connection, poolAddress, {
      cluster: "mainnet-beta"
    });
    const userPositions = await dlmmPool.getPositionsByUserAndLbPair(ownerPublicKey);
    const userPosition = userPositions.userPositions.find(({ publicKey }) =>
        publicKey.equals(positionAddress)
    );
    if (!userPosition) {
        throw new Error("Position not found");
    }

    // Get claimable fees from position data
    const claimableFees = {
        feeX: userPosition.positionData.feeX,
        feeY: userPosition.positionData.feeY,
        rewardOne: userPosition.positionData.rewardOne,
        rewardTwo: userPosition.positionData.rewardTwo
    };
    
    const tokenXDecimals = dlmmPool.tokenX.mint.decimals;
    const tokenYDecimals = dlmmPool.tokenY.mint.decimals;
    
    const feeX = claimableFees.feeX.toNumber() / Math.pow(10, tokenXDecimals);
    const feeY = claimableFees.feeY.toNumber() / Math.pow(10, tokenYDecimals);
    const rewardOne = claimableFees.rewardOne.toNumber() / Math.pow(10, tokenXDecimals);
    const rewardTwo = claimableFees.rewardTwo.toNumber() / Math.pow(10, tokenYDecimals);
    
    console.log("Claimable Fees:");
    console.log(`${dlmmPool.tokenX.mint.address.toBase58()}: ${feeX}`);
    console.log(`${dlmmPool.tokenY.mint.address.toBase58()}: ${feeY}`);

    console.log("\nClaimable Rewards:");
    console.log(`${dlmmPool.tokenX.mint.address.toBase58()}: ${rewardOne}`);
    console.log(`${dlmmPool.tokenY.mint.address.toBase58()}: ${rewardTwo}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

getPositionFees();