# DBC (Dynamic Bonding Curve)

This folder contains all the scripts to interact with Meteora's Dynamic Bonding Curve

## Quick Launch
- Launch a token using the default config key or existing config key. [Launch Pool](./quick-launch/src/launch-pool.ts)


## Create Config
- Create a new bonding curve config key. [Create Config](./create-config/src/create-config.ts)
- Create partner metadata for token launches. [Create Partner Metadata](./create-config/src/create-partner-metadata.ts)
- Simulate a bonding curve based on launch params set. [Simulate Curve](./create-config/src/simulate-curve.ts)

## Migrate Pool
- Manually migrate a DBC pool to DAMM V1. [Migrate to DAMM V1](./migrate-pool/src/migrate-to-damm-v1.ts)
- Manually migrate a DBC pool to DAMM V2. [Migrate to DAMM V2](./migrate-pool/src/migrate-to-damm-v2.ts)

## Swap
- Get a quote for a token swap. [Swap Quote](./swap/src/swap-quote.ts)
- Execute a token swap. [Swap Buy](./swap/src/swap-buy.ts)


## Terminology

**Config Key**: A config key is an address on chain that stores launch parameters. It can be used multiple times and is used to launch tokens.
