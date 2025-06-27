import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  DAMM_V2_MIGRATION_FEE_ADDRESS,
  DynamicBondingCurveClient,
  deriveDbcPoolAddress,
  deriveDammV2MigrationMetadataAddress,
  deriveBaseKeyForLocker,
  deriveEscrow,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { BN } from "bn.js";
import bs58 from "bs58";
import { searcherClient } from "jito-ts/dist/sdk/block-engine/searcher";
import { Bundle } from "jito-ts/dist/sdk/block-engine/types";
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

async function migrateToDammV2() {

  // Variables to be configured
  const baseMint = new PublicKey("");

  //


  const JITO_BLOCK_ENGINE_URL = "mainnet.block-engine.jito.wtf";

  const JITO_TIP_ACCOUNT = new PublicKey(
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"
  );


  try {
    const client = new DynamicBondingCurveClient(connection, "confirmed");

    const virtualPoolState = await client.state.getPoolByBaseMint(baseMint);
    if (!virtualPoolState) {
      throw new Error(`Pool not found for base mint: ${baseMint.toString()}`);
    }

    const config = virtualPoolState.account.config;
    if (!config) {
      throw new Error("Pool config is undefined");
    }

    const poolConfigState = await client.state.getPoolConfig(config);

    console.log("poolConfigState", poolConfigState);

    const quoteMint = new PublicKey(poolConfigState.quoteMint);

    const migrationFeeOption = poolConfigState.migrationFeeOption;
    const dammConfigAddress = new PublicKey(
      DAMM_V2_MIGRATION_FEE_ADDRESS[migrationFeeOption]
    );

    const poolAddress = deriveDbcPoolAddress(quoteMint, baseMint, config);
    console.log("Derived pool address:", poolAddress.toString());

    // check if migration metadata exists
    console.log("Checking if migration metadata exists...");
    const migrationMetadata = deriveDammV2MigrationMetadataAddress(poolAddress);
    console.log("Migration metadata address:", migrationMetadata.toString());

    const metadataAccount = await connection.getAccountInfo(migrationMetadata);
    let metadataTx: Transaction | null = null;
    if (!metadataAccount) {
      console.log("Creating migration metadata...");
      metadataTx = await client.migration.createDammV2MigrationMetadata({
        payer: payer.publicKey,
        virtualPool: poolAddress,
        config: config,
      });
    } else {
      console.log("Migration metadata already exists");
    }

    let lockerTx: Transaction | null = null;
    if (poolConfigState.lockedVestingConfig.amountPerPeriod.gt(new BN(0))) {
      const base = deriveBaseKeyForLocker(poolAddress);
      const escrow = deriveEscrow(base);
      const escrowAccount = await connection.getAccountInfo(escrow);

      if (!escrowAccount) {
        console.log("Locker not found, creating locker...");
        lockerTx = await client.migration.createLocker({
          virtualPool: poolAddress,
          payer: payer.publicKey,
        });
      } else {
        console.log("Locker already exists, skipping creation");
      }
    } else {
      console.log("No locked vesting found, skipping locker creation");
    }

    // migrate to DAMM V2
    console.log("Migrating to DAMM V2...");
    if (virtualPoolState.account.isMigrated === 0) {
      const migrateTx = await client.migration.migrateToDammV2({
        payer: payer.publicKey,
        virtualPool: poolAddress,
        dammConfig: dammConfigAddress,
      });

      // Create tip transaction
      const tipTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: JITO_TIP_ACCOUNT,
          lamports: 3_000_000, // 0.003 SOL tip
        })
      );

      // Get latest blockhash for all transactions
      const { blockhash } = await connection.getLatestBlockhash("confirmed");

      // Set blockhash and fee payer for all transactions
      if (metadataTx) {
        metadataTx.recentBlockhash = blockhash;
        metadataTx.feePayer = payer.publicKey;
        metadataTx.sign(payer);
      }
      if (lockerTx) {
        lockerTx.recentBlockhash = blockhash;
        lockerTx.feePayer = payer.publicKey;
        lockerTx.sign(payer);
      }
      migrateTx.transaction.recentBlockhash = blockhash;
      migrateTx.transaction.feePayer = payer.publicKey;
      migrateTx.transaction.sign(payer, migrateTx.firstPositionNftKeypair, migrateTx.secondPositionNftKeypair);
      
      tipTx.recentBlockhash = blockhash;
      tipTx.feePayer = payer.publicKey;
      tipTx.sign(payer);

      // Convert all transactions to versioned transactions
      const versionedTransactions = [
        ...(metadataTx ? [metadataTx as unknown as VersionedTransaction] : []),
        ...(lockerTx ? [lockerTx as unknown as VersionedTransaction] : []),
        migrateTx.transaction as unknown as VersionedTransaction,
        tipTx as unknown as VersionedTransaction
      ];

      const bundle = new Bundle(versionedTransactions, 1);

      const searcher = searcherClient(JITO_BLOCK_ENGINE_URL);

      const result = await searcher.sendBundle(bundle);

      console.log(`Migration to DAMM V2 completed successfully!`);
    } else {
      console.log("Pool already migrated to DAMM V2");
    }
  } catch (error) {
    console.error("Failed to migrate to DAMM V2:", error);
  }
}

migrateToDammV2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
