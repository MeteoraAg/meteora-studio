import {
  Connection,
  Keypair,
  PublicKey
} from "@solana/web3.js";
import { CpAmm, derivePositionNftAccount } from "@meteora-ag/cp-amm-sdk";
import { BN, Wallet } from "@coral-xyz/anchor";
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


async function getAndLockPosition() {

  // Variables to be configured
  //Example of locking position for 1 year
  const poolAddress = new PublicKey("");
  const positionOwner = new PublicKey("");
  const positionToLock = new PublicKey("");
  const lockPeriodInSeconds = 365 * 24 * 60 * 60; // 1 year in seconds

  //
  console.log("Position owner:", positionOwner.toBase58());
  console.log("Position to lock:", positionToLock.toBase58());

  const cpAmm = new CpAmm(connection);

  try {
    // get pool state
    const poolState = await cpAmm.fetchPoolState(poolAddress); // DAMM V2 pool address (can use deriveDAMMV2PoolAddress)

    // get position address for the user
    const userPositions = await cpAmm.getUserPositionByPool(
      poolAddress, // DAMM V2 pool address (can use deriveDAMMV2PoolAddress)
      positionOwner // user wallet address
    );

    if (userPositions.length === 0) {
      console.log("No positions found for this user.");
      return;
    }

    // display information about each position
    userPositions.forEach((position, index) => {
      console.log(`\nPosition #${index + 1}:`);
      console.log(`Position Address: ${position.position.toBase58()}`);
      console.log(`NFT Account: ${position.positionNftAccount.toBase58()}`);
      console.log(
        `Total Liquidity: ${position.positionState.unlockedLiquidity
          .add(position.positionState.vestedLiquidity)
          .toString()}`
      );
      console.log(
        `Unlocked Liquidity: ${position.positionState.unlockedLiquidity.toString()}`
      );
      console.log(
        `Vested Liquidity: ${position.positionState.vestedLiquidity.toString()}`
      );
    });

    // Find the specific position to lock
    const targetPosition = userPositions.find(
      position => position.position.equals(positionToLock)
    );

    if (!targetPosition) {
      console.log(`Position ${positionToLock.toBase58()} not found in user's positions.`);
      console.log("Available positions:");
      userPositions.forEach((position, index) => {
        console.log(`  ${index + 1}. ${position.position.toBase58()}`);
      });
      return;
    }

    console.log(`\nLocking position: ${targetPosition.position.toBase58()}`);
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const cliffPoint = new BN(currentTimestamp + lockPeriodInSeconds);
    const periodFrequency = new BN(1);
    const numberOfPeriods = 0; // Set to 0 since we want all liquidity at cliff
    const cliffUnlockLiquidity =
      targetPosition.positionState.unlockedLiquidity;
    const liquidityPerPeriod = new BN(0);

    // create vesting account
    const vestingAccount = Keypair.generate(); // no need to save this keypair
    console.log(
      "Created vesting account:",
      vestingAccount.publicKey.toBase58()
    );

    // Lock the position
    const lockPositionTx = await cpAmm.lockPosition({
      owner: payer.publicKey,
      pool: targetPosition.positionState.pool,
      payer: payer.publicKey,
      vestingAccount: vestingAccount.publicKey,
      position: targetPosition.position,
      positionNftAccount: targetPosition.positionNftAccount,
      cliffPoint,
      periodFrequency,
      cliffUnlockLiquidity,
      liquidityPerPeriod,
      numberOfPeriod: numberOfPeriods,
    });

    // send and confirm the transaction
    const signature = await connection.sendTransaction(lockPositionTx, [
      payer,
      vestingAccount,
    ]);
    await connection.confirmTransaction(signature, "confirmed");

    console.log("\nPosition locked successfully!");
    console.log("Transaction: https://solscan.io/tx/" + signature);
    console.log("Vesting account:", vestingAccount.publicKey.toBase58());

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

getAndLockPosition()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });