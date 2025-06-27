## DAMM V2 Create Pool

## Scripts

### Create Pool

Creates a new DAMM V2 pool with initial liquidity
- [Create DAMM V2 Pool](./src/create-pool.ts)

### Get Configs

Retrieves available pool configurations for DAMM V2
- [Get Configs](./src/get-configs.ts)

## Usage

1. Enter your parameters into the script
	
- [Create DAMM V2 Pool](./src/create-pool.ts)
Enter the following parameters:
  - `tokenAMint`: The mint address of token A
  - `tokenBMint`: The mint address of token B
  - `config`: The pool configuration address
  - `tokenADecimals`: Number of decimals for token A
  - `tokenBDecimals`: Number of decimals for token B
  - `tokenAAmount`: Initial amount of token A to deposit
  - `tokenBAmount`: Initial amount of token B to deposit
  - `initialPrice`: Initial price ratio between tokens
  - `lockInitialLiquidity`: Whether to lock the initial liquidity

- [Get Configs](./src/get-configs.ts)
This script retrieves and displays available pool configurations. It filters for permissionless configs by default.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# damm-v2-create-pool
	# damm-v2-get-configs
	```
