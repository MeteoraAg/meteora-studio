import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import AmmImpl from "@meteora-ag/dynamic-amm-sdk";
import bs58 from "bs58";
import { ComputeBudgetProgram } from "@solana/web3.js";
import 'dotenv/config';


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


async function checkAndClaimLockFees() {
  try {

    // Variables to be configured
    const poolAddress = new PublicKey("");
    const receiver = ""; // Enter receiver public key here. Default is owner.

    //

    const receiverPublicKey = receiver ? new PublicKey(receiver) : undefined;

    // init AMM instance
    const amm = await AmmImpl.create(connection as any, poolAddress);
    const tokenADecimals = amm.vaultA.tokenMint.decimals;
    const tokenAAddress = amm.vaultA.tokenMint.address.toString();
    const tokenBDecimals = amm.vaultB.tokenMint.decimals;
    const tokenBAddress = amm.vaultB.tokenMint.address.toString();
    console.log(amm.decimals)
    // get user's lock escrow info
    const lockEscrow = await amm.getUserLockEscrow(owner.publicKey);

    if (!lockEscrow) {
      console.log("No lock escrow found for this user");
      return;
    }

    // check if there are unclaimed fees
    const unclaimedFees = lockEscrow.fee.unClaimed;

    if (unclaimedFees.lp.isZero()) {
      console.log("No unclaimed fees available");
      return;
    }

    console.log("Unclaimed fees:");
    console.log(`LP tokens: ${unclaimedFees.lp.toNumber() / 10 ** amm.decimals}`);
    console.log(`${tokenAAddress}: ${unclaimedFees.tokenA.toNumber() / 10 ** tokenADecimals}`);
    console.log(`${tokenBAddress}: ${unclaimedFees.tokenB.toNumber() / 10 ** tokenBDecimals}`);

    const amountToClaim = unclaimedFees.lp;

    const tempWSolAcc = Keypair.generate();

    // create and send claim transaction
    const claimTx = await amm.claimLockFee(
      owner.publicKey,
      amountToClaim,
      payer.publicKey,
      receiverPublicKey,
      tempWSolAcc?.publicKey
    );

    // Add priority fees
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 50000,
    });

    claimTx.add(modifyComputeUnits);
    claimTx.add(addPriorityFee);

    // sign and send transaction
    const signers = [owner];
    if (payer) signers.push(payer);
    if (receiverPublicKey) signers.push(tempWSolAcc);

    const signature = await connection.sendTransaction(claimTx as any, signers);

    console.log(`Claim transaction sent: ${signature}`);
    console.log("Waiting for confirmation...");

    // const maxRetries = 3;
    // let retryCount = 0;
    // let confirmed = false;

    // while (retryCount < maxRetries && !confirmed) {
    //   try {
    //     const confirmation = await connection.confirmTransaction(
    //       {
    //         signature,
    //         blockhash: claimTx.recentBlockhash!,
    //         lastValidBlockHeight: (
    //           await connection.getLatestBlockhash()
    //         ).lastValidBlockHeight,
    //       },
    //       "confirmed"
    //     );

    //     if (confirmation.value.err) {
    //       throw new Error(`Transaction failed: ${confirmation.value.err}`);
    //     }

    //     confirmed = true;
    //     console.log("Fees claimed successfully!");
      // } catch (error) {
      //   retryCount++;
      //   if (retryCount === maxRetries) {
      //     console.error(`Transaction failed after ${maxRetries} attempts.`);
      //     console.error(
      //       "Please check the transaction status manually using the signature above."
      //     );
      //     throw error;
      //   }
      //   console.log(`Confirmation attempt ${retryCount} failed, retrying...`);
      //   await new Promise((resolve) => setTimeout(resolve, 2000));
      // }
    // }
  } catch (error) {
    console.error("Error claiming fees:", error);
  }
}

checkAndClaimLockFees()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});

