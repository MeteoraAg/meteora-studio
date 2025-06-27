import {
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import {
  CpAmm,
  getTokenProgram,
  getUnClaimReward,
} from "@meteora-ag/cp-amm-sdk";
import 'dotenv/config';

  
  const connection = new Connection(
      process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
  );
  
  
  
async function checkPositionFee() {
  
    // Variables to be configured
    const poolAddress = new PublicKey("");
    const positionAddress = new PublicKey("");

    //
  
    const cpAmm = new CpAmm(connection);
    try {
      // get pool state
      const poolState = await cpAmm.fetchPoolState(poolAddress);
      const tokenAMint = poolState.tokenAMint;
      const tokenBMint = poolState.tokenBMint;
      const tokenAData = await getMint(connection, tokenAMint);
      const tokenBData = await getMint(connection, tokenBMint);

      const positionState = await cpAmm.fetchPositionState(
        positionAddress
      );
      console.log("Position Address:", positionAddress.toBase58());
      const unClaimedReward = getUnClaimReward(poolState, positionState);
      console.log(tokenAMint.toBase58(), unClaimedReward.feeTokenA.toNumber() / 10 ** tokenAData.decimals);
      console.log(tokenBMint.toBase58(), unClaimedReward.feeTokenB.toNumber() / 10 ** tokenBData.decimals);
    
    } catch (error) {
      console.error("Error:", error);
    }
}

checkPositionFee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });