import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import AmmImpl, { PROGRAM_ID } from '@meteora-ag/dynamic-amm-sdk';
import { derivePoolAddressWithConfig } from '@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/utils';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AnchorProvider, BN, Wallet } from '@coral-xyz/anchor';
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


async function createMemecoinPool() {

    //variables to be configured
    const memecoinMint = new PublicKey('');
    const tokenBMint = new PublicKey('');

    const memecoinAmount = 1_000_000
    const tokenBAmount = 10

    const memecoinDecimals = 6
    const tokenBDecimals = 9

    const config = new PublicKey('') // use get-config.ts to get a config

    // Create pool
    const programId = new PublicKey(PROGRAM_ID);

    const provider = new AnchorProvider(connection, new Wallet(payer), {
        commitment: "confirmed",
      });

    console.log("Pool configuration:");
    console.log("Token A:", memecoinMint.toBase58());
    console.log("Token B:", tokenBMint.toBase58());
    console.log("Config address:", config.toBase58());
    console.log("Initial liquidity - Token A:", memecoinAmount.toString());
    console.log("Initial liquidity - Token B:", tokenBAmount.toString());

    const feeConfigurations = await AmmImpl.getFeeConfigurations(provider.connection, {
    programId: PROGRAM_ID,
    });
    const feeConfig = feeConfigurations.find(({ publicKey }) => publicKey.equals(config));
    
    // Get pool address
    const poolPubkey = derivePoolAddressWithConfig(memecoinMint, tokenBMint, feeConfig.publicKey, programId);

    console.log("Pool Address", poolPubkey.toString())
    
    const transactions = await AmmImpl.createPermissionlessConstantProductMemecoinPoolWithConfig(
    provider.connection,
    payer.publicKey, // payer
    memecoinMint,
    tokenBMint,
    new BN(memecoinAmount * 10 ** memecoinDecimals),
    new BN(tokenBAmount * 10 ** tokenBDecimals),
    feeConfig.publicKey,
    { isMinted: true },
    );

    // with M3M3 vault
    // const feeDurationInDays = 7;
    // const numOfStakers = 1000;
    // const feeClaimStartTime = roundToNearestMinutes(new Date(), {
    // nearestTo: 30,
    // });
    // const cooldownDurationInHours = 6;

    // const transactions = await AmmImpl.createPermissionlessConstantProductMemecoinPoolWithConfig(
    // provider.connection,
    // payer.publicKey, // payer
    // memecoinMint,
    // tokenBMint,
    // memecoinAmount,
    // tokenBAmount,
    // feeConfig.publicKey,
    // { isMinted: true },
    // {
    //     feeVault: {
    //     secondsToFullUnlock: feeDurationInDays ? new BN(feeDurationInDays * 86400) : new BN(0),
    //     topListLength: numOfStakers || 0,
    //     startFeeDistributeTimestamp: feeClaimStartTime ? new BN(feeClaimStartTime.getTime() / 1000) : null,
    //     unstakeLockDuration: cooldownDurationInHours ? new BN(cooldownDurationInHours * 3600) : new BN(0),
    //     },
    //     // other options
    // },
    // );

    for (const transaction of transactions) {
    transaction.sign(payer);
    const txHash = await provider.connection.sendRawTransaction(transaction.serialize());
    await provider.connection.confirmTransaction(txHash, 'finalized');
    console.log('Transaction: https://solscan.io/tx/' + txHash);
    }
}

createMemecoinPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });