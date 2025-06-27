import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import AmmImpl from "@meteora-ag/dynamic-amm-sdk";
import bs58 from "bs58";
import { ComputeBudgetProgram } from "@solana/web3.js";
import 'dotenv/config';
import { BN, AnchorProvider, Wallet } from "@coral-xyz/anchor";


const PAYER_PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY;
if (!PAYER_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
}
const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
const payer = Keypair.fromSecretKey(payerSecretKey);

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || PAYER_PRIVATE_KEY;
if (!OWNER_PRIVATE_KEY) {
    throw new Error("OWNER_PRIVATE_KEY is not set");
}
const ownerSecretKey = bs58.decode(OWNER_PRIVATE_KEY);
const owner = Keypair.fromSecretKey(ownerSecretKey);
console.log("Owner public key:", owner.publicKey.toBase58());

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);


async function withdrawLiquidity() {
  try {

        // Variables to be configured
        // Example of withdrawing 0.1 pool tokens from a USDC/SOL pool.
        const poolAddress = new PublicKey("5yuefgbJJpmFNK2iiYbLSpv1aZXq7F9AUKkZKErTYCvs");
        const slippage = 0.1; // Max to 2 decimal place
        const poolTokenAmount = 0.1

        //


        // init AMM instance
        const amm = await AmmImpl.create(connection as any, poolAddress);

        // Use this to withdraw full liquidity
        // const LpBalance = await amm.getUserBalance(payer.publicKey);
        // const poolTokenAmount = LpBalance.toNumber()/10**amm.decimals


        const provider = new AnchorProvider(connection, new Wallet(payer), {
            commitment: "confirmed",
          });

        const { poolTokenAmountIn, tokenAOutAmount, tokenBOutAmount } = amm.getWithdrawQuote(
          new BN(poolTokenAmount * 10**amm.decimals),
          slippage,
        ); // use lp balance for full withdrawal

        console.log("Pool Token Input", poolTokenAmountIn.toNumber()/10**amm.decimals);
        console.log("Token A Output", tokenAOutAmount.toNumber()/10**amm.tokenAMint.decimals);
        console.log("Token B Output", tokenBOutAmount.toNumber()/10**amm.tokenBMint.decimals);

        const withdrawTx = await amm.withdraw(
          payer.publicKey,
          poolTokenAmountIn,
          tokenAOutAmount,
          tokenBOutAmount,
        ); // Web3 Transaction Object
        const withdrawResult = await provider.sendAndConfirm(withdrawTx); // Transaction hash
        
        
        console.log("Transaction Signature", withdrawResult);
        console.log("Transaction: https://solscan.io/tx/" + withdrawResult);

  } catch (error) {
    console.error(error);
  }
}

withdrawLiquidity()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
  });
