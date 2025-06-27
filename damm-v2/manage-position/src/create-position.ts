import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { 
  CpAmm, 
  derivePositionAddress, 
  derivePositionNftAccount,
} from "@meteora-ag/cp-amm-sdk";
import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
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

async function createPosition() {

    // Variables to be configured
    //Example of creating a position on a SOL-USDC pool with 0.1 SOL and 15 USDC
    const poolAddress = new PublicKey("CGPxT5d1uf9a8cKVJuZaJAU76t2EfLGbTmRbfvLLZp5j");
    const tokenAAmount = 0.1;
    const tokenADecimals = 9;
    const tokenBAmount = 15; 
    const tokenBDecimals = 6;

    //

    const cpAmm = new CpAmm(connection);
  
    const poolState = await cpAmm.fetchPoolState(poolAddress);
    const tokenAAccountInfo = await connection.getAccountInfo(
      poolState.tokenAMint
    );
  
    let tokenAProgram = TOKEN_PROGRAM_ID;
    let tokenAInfo = undefined;
    if (tokenAAccountInfo?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
      tokenAProgram = tokenAAccountInfo.owner;
      const baseMint = await getMint(
        connection,
        poolState.tokenAMint,
        connection.commitment,
        tokenAProgram
      );
      const epochInfo = await connection.getEpochInfo();
      tokenAInfo = {
        mint: baseMint,
        currentEpoch: epochInfo.epoch,
      };
    }
  
    const addLidTokenAAmount = new BN(tokenAAmount).mul(
      new BN(10 ** tokenADecimals)
    );
    const addLidTokenBAmount = new BN(tokenBAmount).mul(
      new BN(10 ** tokenBDecimals)
    );
  
    // creates position
    console.log("Creating position...");
  
    const positionNft = Keypair.generate();
  
    const liquidityDelta = cpAmm.getLiquidityDelta({
      maxAmountTokenA: addLidTokenAAmount,
      maxAmountTokenB: addLidTokenBAmount,
      sqrtPrice: poolState.sqrtPrice,
      sqrtMinPrice: poolState.sqrtMinPrice,
      sqrtMaxPrice: poolState.sqrtMaxPrice,
      tokenAInfo,
    });
  
    const createPositionTx = await cpAmm.createPositionAndAddLiquidity({
      owner: payer.publicKey,
      pool: poolAddress,
      positionNft: positionNft.publicKey,
      liquidityDelta,
      maxAmountTokenA: addLidTokenAAmount,
      maxAmountTokenB: addLidTokenBAmount,
      tokenAAmountThreshold: addLidTokenAAmount,
      tokenBAmountThreshold: addLidTokenBAmount,
      tokenAMint: poolState.tokenAMint,
      tokenBMint: poolState.tokenBMint,
      tokenAProgram,
      tokenBProgram: TOKEN_PROGRAM_ID,
    });

  
    const signature = await sendAndConfirmTransaction(connection, createPositionTx, [payer, positionNft], { commitment: "confirmed" });
  
    console.log({
      position: derivePositionAddress(positionNft.publicKey).toString(),
      positionNft: positionNft.publicKey.toString(),
      signature,
    });
  }

createPosition()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

