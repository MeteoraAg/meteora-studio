import Ajv from 'ajv';
import { CONFIG_SCHEMA } from './config';
import { MeteoraConfig } from '../utils/types';

export function validateConfig(config: MeteoraConfig) {
  const ajv = new Ajv({
    strict: false,
  });
  const validate = ajv.compile(CONFIG_SCHEMA);
  const isValid = validate(config);
  if (!isValid) {
    console.error(validate.errors);
    throw new Error('Config file is invalid');
  }

  extraConfigValidation(config);
}

export function extraConfigValidation(config: MeteoraConfig) {
  if (!config.keypairFilePath) {
    throw new Error('Missing keypairFilePath in config file.');
  }
  if (!config.rpcUrl) {
    throw new Error('Missing rpcUrl in config file.');
  }

  if (config.createBaseToken && config.baseMint) {
    throw new Error('Both createBaseToken and baseMint cannot be set simultaneously.');
  }

  if (config.dynamicAmm && config.dlmm) {
    throw new Error('Both Dynamic AMM and DLMM configuration cannot be set simultaneously.');
  }

  if (config.dlmm && config.dlmm.hasAlphaVault) {
    if (config.quoteSymbol == null && config.quoteMint == null) {
      throw new Error('Either quoteSymbol or quoteMint must be provided for DLMM');
    }
  }

  if (config.alphaVault) {
    if (
      config.alphaVault.alphaVaultType != 'fcfs' &&
      config.alphaVault.alphaVaultType != 'prorata'
    ) {
      throw new Error(`Alpha vault type ${config.alphaVault.alphaVaultType} isn't supported.`);
    }

    if (
      config.alphaVault.poolType != 'dynamic' &&
      config.alphaVault.poolType != 'dlmm' &&
      config.alphaVault.poolType != 'damm2'
    ) {
      throw new Error(`Alpha vault pool tyep ${config.alphaVault.poolType} isn't supported.`);
    }
  }
}
