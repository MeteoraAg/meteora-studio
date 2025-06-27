import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
  import { BN } from "@coral-xyz/anchor";
  import {
    CpAmm,
    derivePoolAddress,
    derivePositionAddress,
    getSqrtPriceFromPrice,
} from "@meteora-ag/cp-amm-sdk";
import {
    getMint,
    NATIVE_MINT,
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58"
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

async function createPool() {

    // Variables to be configured
    const tokenAMint = new PublicKey("")
    const tokenBMint = new PublicKey("")
    const config = new PublicKey("")
    const tokenADecimals = 6
    const tokenBDecimals = 6
    const tokenAAmount = 4
    const tokenBAmount = 1
    const initialPrice = 0.25
    const lockInitialLiquidity = false

    //
  
    const cpAmm = new CpAmm(connection);
  
    const configState = await cpAmm.fetchConfigState(config);
    const tokenAAccountInfo = await connection.getAccountInfo(tokenAMint);
  
    let tokenAProgram = TOKEN_PROGRAM_ID;
    let tokenAInfo = undefined;
    if (tokenAAccountInfo?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
      tokenAProgram = tokenAAccountInfo.owner;
      const baseMint = await getMint(
        connection,
        tokenAMint,
        connection.commitment,
        tokenAProgram
      );
      const epochInfo = await connection.getEpochInfo();
      tokenAInfo = {
        mint: baseMint,
        currentEpoch: epochInfo.epoch,
      };
    }
  
    const initialPoolTokenAAmount = new BN(tokenAAmount).mul(
      new BN(10 ** tokenADecimals)
    );
    const initialPoolTokenBAmount = new BN(tokenBAmount).mul(
      new BN(10 ** tokenBDecimals)
    );
    const initSqrtPrice = getSqrtPriceFromPrice(
      initialPrice.toString(),
      tokenADecimals,
      tokenBDecimals
    );
    const liquidityDelta = cpAmm.getLiquidityDelta({
      maxAmountTokenA: initialPoolTokenAAmount,
      maxAmountTokenB: initialPoolTokenBAmount,
      sqrtPrice: initSqrtPrice,
      sqrtMinPrice: configState.sqrtMinPrice,
      sqrtMaxPrice: configState.sqrtMaxPrice,
      tokenAInfo,
    });

    // create pool (included create first position)
    const positionNft = Keypair.generate();
    const initPoolTx = await cpAmm.createPool({
      payer: payer.publicKey,
      creator: payer.publicKey,
      config: config,
      positionNft: positionNft.publicKey,
      tokenAMint: tokenAMint,
      tokenBMint: tokenBMint,
      tokenAAmount: initialPoolTokenAAmount,
      tokenBAmount: initialPoolTokenBAmount,
      liquidityDelta: liquidityDelta,
      initSqrtPrice: initSqrtPrice,
      activationPoint: null,
      tokenAProgram,
      tokenBProgram: TOKEN_PROGRAM_ID,
      isLockLiquidity: lockInitialLiquidity,
    });
  
    const signature = await sendAndConfirmTransaction(
      connection,
      initPoolTx,
      [payer, positionNft],
      {
        commitment: "confirmed",
      }
    );
    console.log("Pool Address", derivePoolAddress(config, tokenAMint, tokenBMint).toString());
    console.log("Position Address", derivePositionAddress(positionNft.publicKey).toString());
    console.log("Position NFT Address", positionNft.publicKey.toString());
    console.log("Transaction Signature", signature);
    console.log("Transaction: https://solscan.io/tx/" + signature);
  

}

createPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
