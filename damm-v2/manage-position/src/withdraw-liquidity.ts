import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { 
    CpAmm, 
    derivePositionNftAccount,
} from "@meteora-ag/cp-amm-sdk";

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

async function withdrawLiquidity() {
  
    // Variables to be configured
    // Example of removing 10 liquidity tokens from SOL - USDC pool
    const poolAddress = new PublicKey("5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6");
    const positionAddress = new PublicKey("") // Use get-positions to get the position addresses by user
    const liquidityTokenAmount = 10


    const cpAmm = new CpAmm(connection);
    const poolState = await cpAmm.fetchPoolState(poolAddress);
    const tokenAMint = poolState.tokenAMint;
    const tokenBMint = poolState.tokenBMint;

    const tokenAAccount = await connection.getAccountInfo(tokenAMint);
    const tokenBAccount = await connection.getAccountInfo(tokenBMint);

    const positionState = await cpAmm.fetchPositionState(positionAddress); 

    const liquidityToRemove = new BN(liquidityTokenAmount).mul(new BN(2).pow(new BN(64)))

    // Use this to withdraw half of the liquidity
    //const liquidityToRemove = positionState.unlockedLiquidity.div(new BN(2));

    const withdrawQuote = await cpAmm.getWithdrawQuote({
        liquidityDelta: liquidityToRemove,
        sqrtPrice: poolState.sqrtPrice,
        minSqrtPrice: poolState.sqrtMinPrice,
        maxSqrtPrice: poolState.sqrtMaxPrice,
    });
    
    console.log("Liquidity tokens to withdraw", liquidityToRemove.toString()/2**64)
    console.log(`Expected token A: ${withdrawQuote.outAmountA.toNumber()/2**64}`);
    console.log(`Expected token B: ${withdrawQuote.outAmountB.toNumber()/2**64}`);


    const removeLiquidityTx = await cpAmm.removeLiquidity({
        owner: payer.publicKey,
        pool: poolAddress,
        position: positionAddress,
        positionNftAccount: derivePositionNftAccount(positionState.nftMint),
        liquidityDelta: liquidityToRemove,
        tokenAAmountThreshold: new BN(0),
        tokenBAmountThreshold: new BN(0),
        tokenAMint: poolState.tokenAMint,
        tokenBMint: poolState.tokenBMint,
        tokenAVault: poolState.tokenAVault,
        tokenBVault: poolState.tokenBVault,
        tokenAProgram: tokenAAccount?.owner as PublicKey,
        tokenBProgram: tokenBAccount?.owner as PublicKey,
        vestings: [],
        currentPoint: new BN(0)
    });


    const signature = await sendAndConfirmTransaction(connection, removeLiquidityTx, [
        payer,
        
    ]);

    console.log("\nLiquidity removed successfully!");
    console.log("Transaction: https://solscan.io/tx/" + signature);
    process.exit(0);
}

withdrawLiquidity()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });

