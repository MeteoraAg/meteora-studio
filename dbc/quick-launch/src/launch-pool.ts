import {
    Connection,
    Keypair,
    sendAndConfirmTransaction,
    PublicKey
} from "@solana/web3.js";
import {
    DynamicBondingCurveClient,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
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



async function quickLaunch() {

    // Variables to be configured
    const tokenParams = {
        name: "PUMP IT Token",
        symbol: "PUMP",
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgk7EaZ4MxetCM1IB2B8z0MFJZg8IOn8AcMw&s",
    };

    const configKey = new PublicKey('6ZjAF1MqbWZ4cCHGqpAMAZbUBi5KnAZDTDT6nXEA5iYZ') // Or use custom / partner config key 
    
    //


    // Attempt to grind token address to match first 3 characters of ticker
    const start = tokenParams.symbol.slice(0, 3);
    let baseMint = Keypair.generate();
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    if (base58Regex.test(start)) {
        var attempts = 0
        while (attempts < 100000) {
            const keypair = Keypair.generate();
            attempts += 1
            if (keypair.publicKey.toBase58().slice(0, 3) === start) {
                baseMint = keypair;
                break;
            }
        }
    }

    const client = new DynamicBondingCurveClient(connection, "confirmed");
    
    const createPoolTx = await client.pool.createPool({
        ...tokenParams,
        config: configKey,
        baseMint: baseMint.publicKey,
        payer: payer.publicKey,
        poolCreator: payer.publicKey,
    });

    const createPoolSignature = await sendAndConfirmTransaction(
        connection,
        createPoolTx,
        [payer, baseMint, payer],
        {
        commitment: "confirmed",
        skipPreflight: true,
        }
    );
    console.log(`Generated base mint: ${baseMint.publicKey.toString()}`);
    console.log(`Transaction: https://solscan.io/tx/${createPoolSignature}`);
    console.log(
        `Trade on Jup Pro: https://jup.ag/tokens/${baseMint.publicKey.toString()}`
    );
}

quickLaunch()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
  