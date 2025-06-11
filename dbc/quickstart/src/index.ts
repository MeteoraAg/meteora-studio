import {
  buildCurveWithMarketCap,
  DynamicBondingCurveClient,
  getMigrationMarketCap,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import "dotenv/config";
import { configKeyParams, quoteMint, TOTAL_TOKEN_SUPPLY } from "../examples/basic";


console.log(configKeyParams);
const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!WALLET_PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set");
}
const walletSecretKey = bs58.decode(WALLET_PRIVATE_KEY);
const wallet = Keypair.fromSecretKey(walletSecretKey);

console.log(wallet.publicKey.toString());

const connection = new Connection(
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);

async function main() {
  const client = new DynamicBondingCurveClient(connection, "confirmed");

  // Step 1: Create Config Key
  const configKey = Keypair.generate();

  const initialMarketCap = 1_000_000;
  const migrationQuoteThreshold = 5_000_000;

  const migrationMarketCap = getMigrationMarketCap(40, TOTAL_TOKEN_SUPPLY, migrationQuoteThreshold, 0);
  const curveConfig = buildCurveWithMarketCap(configKeyParams(initialMarketCap, migrationMarketCap.toNumber()));

  const createConfigTx = await client.partner.createConfig({
    config: configKey.publicKey,
    feeClaimer: wallet.publicKey,
    leftoverReceiver: wallet.publicKey,
    payer: wallet.publicKey,
    quoteMint: quoteMint,
    ...curveConfig,
  });

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  createConfigTx.recentBlockhash = blockhash;
  createConfigTx.feePayer = wallet.publicKey;

  createConfigTx.partialSign(configKey);

  const createConfigSignature = await sendAndConfirmTransaction(
    connection,
    createConfigTx,
    [wallet, configKey],
    { commitment: "confirmed", skipPreflight: true }
  );

  console.log(`Config created successfully! ${configKey.publicKey.toString()}`);
  console.log(`Transaction: https://solscan.io/tx/${createConfigSignature}`);

  // // Wait for config key creation to be confirmed and finalized
  // await connection.confirmTransaction(createConfigSignature, "finalized");

  // // Step 2: Create Base Mint Token Pool
  // const baseMint = Keypair.generate();

  // const createPoolTx = await client.pool.createPool({
  //   ...tokenParams,
  //   config: configKey.publicKey,
  //   baseMint: baseMint.publicKey,
  //   payer: wallet.publicKey,
  //   poolCreator: wallet.publicKey,
  // });

  // const createPoolSignature = await sendAndConfirmTransaction(
  //   connection,
  //   createPoolTx,
  //   [wallet, baseMint, wallet],
  //   {
  //     commitment: "confirmed",
  //     skipPreflight: true,
  //   }
  // );
  // console.log(`Generated base mint: ${baseMint.publicKey.toString()}`);
  // console.log(`Transaction: https://solscan.io/tx/${createPoolSignature}`);
  // console.log(`Trade on Jup Pro: https://jup.ag/tokens/${baseMint.publicKey.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
