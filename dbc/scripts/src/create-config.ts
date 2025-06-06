import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  DynamicBondingCurveClient,
  CollectFeeMode,
  TokenType,
  ActivationType,
  MigrationOption,
  FeeSchedulerMode,
  MigrationFeeOption,
  TokenDecimal,
  buildCurveWithMarketCap,
  TokenUpdateAuthorityOption,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { NATIVE_MINT } from "@solana/spl-token";
import BN from "bn.js";
import "dotenv/config";
import bs58 from "bs58";

async function createConfig() {
  const PAYER_PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PAYER_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
  }
  const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
  const payer = Keypair.fromSecretKey(payerSecretKey);
  console.log("Payer public key:", payer.publicKey.toBase58());

  const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  const config = Keypair.generate();
  console.log(`Config account: ${config.publicKey.toString()}`);

  const feeClaimer = new PublicKey("");

  const curveConfig = buildCurveWithMarketCap({
    totalTokenSupply: 1000000000,
    initialMarketCap: 20,
    migrationMarketCap: 320,
    migrationOption: MigrationOption.MET_DAMM_V2,
    tokenBaseDecimal: TokenDecimal.SIX,
    tokenQuoteDecimal: TokenDecimal.NINE,
    lockedVestingParam: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    feeSchedulerParam: {
      startingFeeBps: 100,
      endingFeeBps: 100,
      numberOfPeriod: 0,
      totalDuration: 0,
      feeSchedulerMode: FeeSchedulerMode.Linear,
    },
    dynamicFeeEnabled: true,
    activationType: ActivationType.Slot,
    collectFeeMode: CollectFeeMode.OnlyQuote,
    migrationFeeOption: MigrationFeeOption.FixedBps100,
    tokenType: TokenType.SPL,
    partnerLpPercentage: 0,
    creatorLpPercentage: 0,
    partnerLockedLpPercentage: 100,
    creatorLockedLpPercentage: 0,
    creatorTradingFeePercentage: 0,
    leftover: 10000,
    tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
    migrationFee: {
      feePercentage: 0,
      creatorFeePercentage: 0,
    },
  });

  console.log("curve config", curveConfig);

  try {
    const client = new DynamicBondingCurveClient(connection, "confirmed");

    const transaction = await client.partner.createConfig({
      config: config.publicKey,
      feeClaimer,
      leftoverReceiver: feeClaimer,
      quoteMint: NATIVE_MINT,
      payer: payer.publicKey,
      ...curveConfig,
    });

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;

    transaction.partialSign(config);

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, config],
      { commitment: "confirmed" }
    );

    console.log(`Config created successfully!`);
    console.log(`Transaction: https://solscan.io/tx/${signature}`);
    console.log(`Config address: ${config.publicKey.toString()}`);
  } catch (error) {
    console.error("Failed to create config:", error);
  }
}

createConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
