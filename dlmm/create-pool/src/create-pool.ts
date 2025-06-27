import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import DLMM,{ActivationType}from "@meteora-ag/dlmm";
import { getMint } from "@solana/spl-token";
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



async function createPool() {
    // Variables to be configured
    // Example of creating a pool for SOL/USDC
    const baseMint = new PublicKey("So11111111111111111111111111111111111111112");
    const quoteMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const binStep = 4
    const price = 150 // price of base token / price of quote token
    const feeBps = 100 // 1%
    const activationPoint = undefined
    const creatorPoolOnOffControl = undefined


    const baseMintDecimals = (await getMint(connection, baseMint)).decimals
    const quoteMintDecimals = (await getMint(connection, quoteMint)).decimals
    const rate = price * (10**(quoteMintDecimals - baseMintDecimals))
    const activeId = DLMM.getBinIdFromPrice(rate, binStep, true)

    console.log("Active Bin ID:", activeId);

    const createLbPairTx = await DLMM.createCustomizablePermissionlessLbPair(
        connection,
        new BN(binStep),
        baseMint,
        quoteMint,
        new BN(activeId),
        new BN(feeBps),
        ActivationType.Slot,
        false,
        payer.publicKey,
        activationPoint, // activationPoint
        creatorPoolOnOffControl, // creatorPoolOnOffControl
        { cluster: "mainnet-beta" } // opt parameter with cluster
    );
    console.log("Pool Address:", createLbPairTx.instructions[0].keys[0].pubkey.toBase58());
    const signature = await sendAndConfirmTransaction(connection, createLbPairTx, [payer], {
        commitment: "confirmed",
    });
    console.log("Transaction sent:", signature);
    console.log("Transaction: https://solscan.io/tx/" + signature);
}

createPool()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });

