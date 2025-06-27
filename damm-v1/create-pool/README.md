# Creating DAMM V1 pool

This folder contains scripts to create **Meteora DAMM V1 pools**.

## Scripts

### Constant Product Pool

Creates a standard constant product AMM pool
- [Create Constant Product Pool](./src/constant-product.ts)

### Memecoin Pool

Creates a memecoin pool with optional M3M3 vault features
- [Create Memecoin Pool](./src/memecoin-pool.ts)

### Stable Pool

Creates a stable pool for tokens with similar values (e.g, USDC and USDT)
- [Create Stable Pool](./src/stable-pool.ts)

### Get Configurations

Retrieves available pool configurations from the Meteora API
- [Get Configurations](./src/get-configs.ts)

## Usage

1. Enter your parameters into the script

- [Create Constant Product Pool](./src/constant-product.ts)
  - `tokenAMint`: Address of token A
  - `tokenBMint`: Address of token B
  - `config`: Pool configuration address
  - `tokenAAmount`: Amount of token A to deposit
  - `tokenBAmount`: Amount of token B to deposit
  - `tokenADecimals`: Decimals of token A
  - `tokenBDecimals`: Decimals of token B

- [Create Memecoin Pool](./src/memecoin-pool.ts)
  - `memecoinMint`: Memecoin mint address
  - `tokenBMint`: Paired token mint address
  - `memecoinAmount`: Memecoin amount to deposit
  - `tokenBAmount`: Paired token amount to deposit
  - `memecoinDecimals`: Memecoin decimals
  - `tokenBDecimals`: Paired token decimals
  - `config`: Configuration address

- [Create Stable Pool](./src/stable-pool.ts)
  - `tokenAMint`: Address of token A
  - `tokenBMint`: Address of token B
  - `tokenAAmount`: Amount of token A to deposit
  - `tokenBAmount`: Amount of token B to deposit
  - `tokenADecimal`: Decimals of token A
  - `tokenBDecimal`: Decimals of token B
  - `feeBps`: Base fee in Bps

- [Get Configurations](./src/get-configs.ts)
No parameters or private key needed. This script fetches all available configs and their data.
Set `onlyPermissionless` to false to get all config keys instead of only the permissionless configs.


2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# damm-v1-create-constant-product-pool
	# damm-v1-create-memecoin-pool
	# damm-v1-create-stable-pool
	# damm-v1-get-configs
	```