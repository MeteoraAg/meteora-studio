import { CliArguments, MeteoraConfig } from '../utils/types';
import { parseArgs } from 'util';
import { safeParseJsonFromFile } from './utils';
import { validateConfig } from './validation';

export function parseCliArguments(): CliArguments {
  const { values } = parseArgs({
    args: process.argv,
    options: {
      config: {
        type: 'string',
      },
    },
    strict: true,
    allowPositionals: true,
  });

  return values;
}

export async function parseConfigFromCli(): Promise<MeteoraConfig> {
  const cliArguments = parseCliArguments();
  if (!cliArguments.config) {
    throw new Error('Please provide a config file path to --config flag');
  }
  const configFilePath = cliArguments.config!;
  console.log(`> Using config file: ${configFilePath}`);

  const config: MeteoraConfig = await safeParseJsonFromFile(configFilePath);

  validateConfig(config);

  return config;
}
