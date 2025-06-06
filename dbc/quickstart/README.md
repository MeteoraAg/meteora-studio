# Dynamic Bonding Curve Quickstart

The Dynamic Bonding Curve Quickstart repository provides a foundational understanding of how the Dynamic Bonding Curve operates. Within the quickstart folder, you'll learn how to create a configuration key and launch a token pool on Solana.

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/MeteoraAg/meteora-studio.git
```

2. Change directory to the `dbc/quickstart` folder

```bash
cd meteora-studio/dbc/quickstart
```

3. Copy `.env.example` file and add your private key and RPC URL into .env (RPC is optional but highly encouraged)

Note: Private key owner will be the owner of the token
```bash
cp .env.example .env
```

4. Install dependencies

```bash
npm install
```

5. For a basic default launch, edit examples/basic.ts to edit token params

Edit `tokenParams` which includes: 
  - Token name
  - Token symbol
  - Token URI (image)
  - Token supply
  - Token decimal 

For more complex launches, edit the launch params:

Edit `configKeyParams` which includes:
  - Initial and migration market cap
  - Vest and cliff params
  - Fee scheduler params
  - Activation type
  - Creator and Partner LP

To read more about the lauch params, visit [DBC Docs](https://docs.meteora.ag/product-overview/dynamic-bonding-curve-dbc-overview/customizable-pool-configuration)

6. Run the script to launch a token

```bash
npm run dbc
```


