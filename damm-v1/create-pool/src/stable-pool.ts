import AmmImpl, { derivePoolAddress } from '@meteora-ag/dynamic-amm-sdk';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import bs58 from "bs58";
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



async function createStablePool() {
    // Variables to be configured
    const tokenAMint = new PublicKey('')
    const tokenBMint = new PublicKey('');

    const tokenAAmount = 10; 
    const tokenBAmount = 10;

    const tokenADecimal = 6;
    const tokenBDecimal = 6;

    const feeBps = new BN(1); // 0.01%

    //

    const provider = new AnchorProvider(connection, new Wallet(payer), {
        commitment: "confirmed",
      });

    console.log("Pool configuration:");
    console.log("Token A:", tokenAMint.toBase58());
    console.log("Token B:", tokenBMint.toBase58());
    console.log("Initial liquidity - Token A:", tokenAAmount.toString());
    console.log("Initial liquidity - Token B:", tokenBAmount.toString());
        
    // Get pool address
    const poolPubkey = derivePoolAddress(
    provider.connection,
    tokenAMint,
    tokenBMint,
    tokenADecimal,
    tokenBDecimal,
    true, // stable
    feeBps,
    );
    console.log("Pool Address", poolPubkey.toString())

    // Create pool
    const transaction = await AmmImpl.createPermissionlessPool(
        provider.connection,
        payer.publicKey, // payer
        tokenAMint,
        tokenBMint,
        new BN(tokenAAmount * 10 ** tokenADecimal),
        new BN(tokenBAmount * 10 ** tokenBDecimal),
        true, // stable,
        feeBps,
    );
    
    transaction.sign(payer);
    const txHash = await provider.connection.sendRawTransaction(transaction.serialize());
    await provider.connection.confirmTransaction(txHash, 'finalized');
    console.log('Transaction: https://solscan.io/tx/' + txHash);

}

createStablePool()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
  });

