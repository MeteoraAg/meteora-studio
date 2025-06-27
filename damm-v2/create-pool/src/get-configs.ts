import {Connection, SystemProgram} from "@solana/web3.js";
import {CpAmm} from "@meteora-ag/cp-amm-sdk";

import "dotenv/config";

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);

async function getConfigs() {

    const onlyPermissionless = true;
    const cpAmm = new CpAmm(connection);
    const configs = await cpAmm.getAllConfigs();
    const systemProgramAddress = SystemProgram.programId.toBase58();
    if (onlyPermissionless) {
        for (const config of configs) {
            if (config.account.poolCreatorAuthority.toBase58() === systemProgramAddress && config.publicKey.toBase58() === "8CNy9goNQNLM4wtgRw528tUQGMKD3vSuFRZY2gLGLLvF") {
                console.log(config.publicKey.toBase58());
                console.log(config.account);
            }
        }
    } else {
        for (const config of configs) {
            console.log(config.publicKey.toBase58());
        }
    }
}

getConfigs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





// Base Fee 
// 0.25%

// Dynamic Fee
// Yes (Current: 0%)

// Liquidity Provider Fee 
// 0.25%

// Protocol Fee
// 0.05%

// Fee Collection Token
// Base + Quote token