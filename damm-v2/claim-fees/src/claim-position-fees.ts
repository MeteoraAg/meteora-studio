import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";

import {
  CpAmm,
  getTokenProgram,
  getUnClaimReward,
} from "@meteora-ag/cp-amm-sdk";
import bs58 from "bs58";
import { getMint } from "@solana/spl-token";
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



async function checkAndClaimPositionFee() {

  // Variables to be configured
  const poolAddress = new PublicKey(""); 
  const positionAddress = new PublicKey("");
  const receiverAddress = ""; // Enter receiver public key here. Leave empty to use payer as receiver.
  
  //
  
  // Set receiver - if receiverAddress is empty, use payer as receiver
  const receiver = receiverAddress ? new PublicKey(receiverAddress) : payer.publicKey;
  
  const cpAmm = new CpAmm(connection);

  try {
    // get pool state
    const poolState = await cpAmm.fetchPoolState(poolAddress); // DAMM V2 pool address (can use deriveDAMMV2PoolAddress)
    // get position address for the user
    const userPositions = await cpAmm.getUserPositionByPool(
      poolAddress, // DAMM V2 pool address (can use deriveDAMMV2PoolAddress)
      payer.publicKey // user wallet address
    );
    if (userPositions.length === 0) {
      console.log("No positions found for this user.");
      return;
    }
    
    const tokenAMint = poolState.tokenAMint;
    const tokenBMint = poolState.tokenBMint;
    const tokenAData = await getMint(connection, tokenAMint);
    const tokenBData = await getMint(connection, tokenBMint);

    const positionState = await cpAmm.fetchPositionState(
      positionAddress
    );
    const unClaimedReward = getUnClaimReward(poolState, positionState);

    console.log(tokenAMint.toBase58(), unClaimedReward.feeTokenA.toNumber() / 10 ** tokenAData.decimals);
    console.log(tokenBMint.toBase58(), unClaimedReward.feeTokenB.toNumber() / 10 ** tokenBData.decimals);

    // Check if one of the tokens is SOL (wrapped SOL)
    const isSolPool = tokenAMint === NATIVE_MINT || tokenBMint === NATIVE_MINT;
    
    let tempWSolAccount: Keypair | undefined;
    if (isSolPool) {
      tempWSolAccount = Keypair.generate();
      console.log("SOL pool detected, using tempWSolAccount:", tempWSolAccount.publicKey.toBase58());
    }

    const claimPositionFeeTx = await cpAmm.claimPositionFee({
      owner: payer.publicKey,
      receiver: receiver,
      pool: poolAddress, // DAMM V2 pool address (can use deriveDAMMV2PoolAddress)
      position: positionAddress,
      positionNftAccount: userPositions[0].positionNftAccount,
      tokenAVault: poolState.tokenAVault,
      tokenBVault: poolState.tokenBVault,
      tokenAMint: poolState.tokenAMint,
      tokenBMint: poolState.tokenBMint,
      tokenAProgram: getTokenProgram(poolState.tokenAFlag),
      tokenBProgram: getTokenProgram(poolState.tokenBFlag),
      feePayer: payer.publicKey,
      ...(tempWSolAccount && { tempWSolAccount: tempWSolAccount.publicKey }), // use only if your quoteMint is SOL
    });

    // send and confirm the transaction
    const signers = [payer];
    if (tempWSolAccount) {
      signers.push(tempWSolAccount);
    }
    
    const signature = await sendAndConfirmTransaction(
      connection,
      claimPositionFeeTx,
      signers,
      {
        commitment: "confirmed",
      }
    );



    console.log("\nPosition fee claimed successfully!");
    console.log("Transaction: https://solscan.io/tx/" + signature);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Execute the main function
checkAndClaimPositionFee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });