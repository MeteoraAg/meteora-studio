import { SystemProgram } from '@solana/web3.js';
import axios from 'axios';

async function getConfigs() {
  const onlyPermissionless = true
  const systemProgramAddress = SystemProgram.programId.toBase58();
  try {
    const response = await axios.get('https://amm-v2.meteora.ag/pool-configs');
    if (onlyPermissionless) {
        for (const config of response.data) {
        if (config.pool_creator_authority === systemProgramAddress) {
            console.log(config)
        }
      }
    } else {
        for (const config of response.data) {
            console.log(config)
        }
    }
  } catch (error) {
    console.error('Error fetching configs:', error);
  }
}

getConfigs();
