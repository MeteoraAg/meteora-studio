import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  DynamicBondingCurveClient,
  deriveDbcPoolAddress,
  deriveDammV1MigrationMetadataAddress,
  deriveBaseKeyForLocker,
  deriveEscrow,
  DAMM_V1_MIGRATION_FEE_ADDRESS,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { BN } from "bn.js";
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

async function migrateToDammV1() {

  // Variables to be configured
  const baseMint = new PublicKey("");

  //

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

    const quoteMint = new PublicKey(poolConfigState.quoteMint);

    const migrationFeeOption = poolConfigState.migrationFeeOption;
    const dammConfigAddress = new PublicKey(
      DAMM_V1_MIGRATION_FEE_ADDRESS[migrationFeeOption]
    );

    const poolAddress = deriveDbcPoolAddress(quoteMint, baseMint, config);
    console.log("Derived pool address:", poolAddress.toString());

    // check if migration metadata exists
    console.log("Checking if migration metadata exists...");
    const migrationMetadata = deriveDammV1MigrationMetadataAddress(poolAddress);
    console.log("Migration metadata address:", migrationMetadata.toString());

    const metadataAccount = await connection.getAccountInfo(migrationMetadata);
    if (!metadataAccount) {
      console.log("Creating migration metadata...");
      const createMetadataTx =
        await client.migration.createDammV1MigrationMetadata({
          payer: payer.publicKey,
          virtualPool: poolAddress,
          config: config,
        });

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      createMetadataTx.recentBlockhash = blockhash;
      createMetadataTx.feePayer = payer.publicKey;

      const metadataSignature = await sendAndConfirmTransaction(
        connection,
        createMetadataTx,
        [payer],
        { commitment: "confirmed" }
      );

      console.log(`Migration metadata created successfully!`);
      console.log(`Transaction: https://solscan.io/tx/${metadataSignature}`);
    } else {
      console.log("Migration metadata already exists");
    }

    // check if locked vesting exists
    if (poolConfigState.lockedVestingConfig.amountPerPeriod.gt(new BN(0))) {
      // Check if locker already exists
      const base = deriveBaseKeyForLocker(poolAddress);
      const escrow = deriveEscrow(base);
      const escrowAccount = await connection.getAccountInfo(escrow);

      if (!escrowAccount) {
        console.log("Locker not found, creating locker...");
        const createLockerTx = await client.migration.createLocker({
          virtualPool: poolAddress,
          payer: payer.publicKey,
        });

        const { blockhash: lockerBlockhash } =
          await connection.getLatestBlockhash("confirmed");
        createLockerTx.recentBlockhash = lockerBlockhash;
        createLockerTx.feePayer = payer.publicKey;

        const lockerSignature = await sendAndConfirmTransaction(
          connection,
          createLockerTx,
          [payer],
          { commitment: "confirmed" }
        );

        console.log(`Locker created successfully!`);
        console.log(`Transaction: https://solscan.io/tx/${lockerSignature}`);
      } else {
        console.log("Locker already exists, skipping creation");
      }
    } else {
      console.log("No locked vesting found, skipping locker creation");
    }

    // migrate to DAMM V1
    console.log("Migrating to DAMM V1...");
    if (virtualPoolState.account.isMigrated === 0) {
      const migrateTx = await client.migration.migrateToDammV1({
        payer: payer.publicKey,
        virtualPool: poolAddress,
        dammConfig: dammConfigAddress,
      });

      const { blockhash: migrateBlockhash } =
        await connection.getLatestBlockhash("confirmed");
      migrateTx.recentBlockhash = migrateBlockhash;
      migrateTx.feePayer = payer.publicKey;

      const migrateSignature = await sendAndConfirmTransaction(
        connection,
        migrateTx,
        [payer],
        { commitment: "confirmed" }
      );

      console.log(`Migration to DAMM V1 completed successfully!`);
      console.log(`Transaction: https://solscan.io/tx/${migrateSignature}`);
    } else {
      console.log("Pool already migrated to DAMM V1");
    }

    if (poolConfigState.creatorLpPercentage > 0) {
      console.log("Claiming Creator DAMM V1 LP tokens...");
      const claimCreatorLpTx = await client.migration.claimDammV1LpToken({
        payer: payer.publicKey,
        virtualPool: poolAddress,
        dammConfig: dammConfigAddress,
        isPartner: false,
      });

      const { blockhash: claimLpBlockhash } =
        await connection.getLatestBlockhash("confirmed");
      claimCreatorLpTx.recentBlockhash = claimLpBlockhash;
      claimCreatorLpTx.feePayer = payer.publicKey;

      const claimCreatorLpSignature = await sendAndConfirmTransaction(
        connection,
        claimCreatorLpTx,
        [payer],
        { commitment: "confirmed" }
      );

      console.log(`Creator DAMM V1 LP tokens claimed successfully!`);
      console.log(
        `Transaction: https://solscan.io/tx/${claimCreatorLpSignature}`
      );
    } else {
      console.log("Creator DAMM V1 LP tokens already claimed");
    }

    if (poolConfigState.partnerLpPercentage > 0) {
      console.log("Claiming Partner DAMM V1 LP tokens...");
      const claimPartnerLpTx = await client.migration.claimDammV1LpToken({
        payer: payer.publicKey,
        virtualPool: poolAddress,
        dammConfig: dammConfigAddress,
        isPartner: true,
      });

      const { blockhash: claimLpBlockhash } =
        await connection.getLatestBlockhash("confirmed");
      claimPartnerLpTx.recentBlockhash = claimLpBlockhash;
      claimPartnerLpTx.feePayer = payer.publicKey;

      const claimPartnerLpSignature = await sendAndConfirmTransaction(
        connection,
        claimPartnerLpTx,
        [payer],
        { commitment: "confirmed" }
      );

      console.log(`Partner DAMM V1 LP tokens claimed successfully!`);
      console.log(
        `Transaction: https://solscan.io/tx/${claimPartnerLpSignature}`
      );
    } else {
      console.log("Partner DAMM V1 LP tokens already claimed");
    }

    if (poolConfigState.creatorLockedLpPercentage > 0) {
      console.log("Locking Creator DAMM V1 LP tokens...");
      const lockCreatorLpTx = await client.migration.lockDammV1LpToken({
        payer: payer.publicKey,
        virtualPool: poolAddress,
        dammConfig: dammConfigAddress,
        isPartner: false,
      });

      const { blockhash: lockLpBlockhash } =
        await connection.getLatestBlockhash("confirmed");
      lockCreatorLpTx.recentBlockhash = lockLpBlockhash;
      lockCreatorLpTx.feePayer = payer.publicKey;

      const lockCreatorLpSignature = await sendAndConfirmTransaction(
        connection,
        lockCreatorLpTx,
        [payer],
        { commitment: "confirmed" }
      );

      console.log(`Creator DAMM V1 LP tokens locked successfully!`);
      console.log(
        `Transaction: https://solscan.io/tx/${lockCreatorLpSignature}`
      );
    } else {
      console.log("Creator DAMM V1 LP tokens already locked");
    }

    if (poolConfigState.partnerLockedLpPercentage > 0) {
      console.log("Locking Partner DAMM V1 LP tokens...");
      const lockPartnerLpTx = await client.migration.lockDammV1LpToken({
        payer: payer.publicKey,
        virtualPool: poolAddress,
        dammConfig: dammConfigAddress,
        isPartner: true,
      });

      const { blockhash: lockLpBlockhash } =
        await connection.getLatestBlockhash("confirmed");
      lockPartnerLpTx.recentBlockhash = lockLpBlockhash;
      lockPartnerLpTx.feePayer = payer.publicKey;

      const lockPartnerLpSignature = await sendAndConfirmTransaction(
        connection,
        lockPartnerLpTx,
        [payer],
        { commitment: "confirmed" }
      );

      console.log(`Partner DAMM V1 LP tokens locked successfully!`);
      console.log(
        `Transaction: https://solscan.io/tx/${lockPartnerLpSignature}`
      );
    } else {
      console.log("Partner DAMM V1 LP tokens already locked");
    }
  } catch (error) {
    console.error("Failed to migrate to DAMM V1:", error);
  }
}

migrateToDammV1()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });