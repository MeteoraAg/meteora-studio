# Meteora Studio
Meteora has the best and the most comprehensive pools on Solana and provides the best tools for liquidity providers and token launchers.

Meteora Studio is a suite of scripts, tools and scaffolds to help you get started with building and launching on Meteora.
 

## Prerequisites:

- [Node.js](https://nodejs.org/) (version 18 or higher) installed

- [TypeScript](https://www.typescriptlang.org/) (version 5.0 or higher)


## Getting started

1. Clone the repo


```bash
git  clone  https://github.com/MeteoraAg/meteora-studio.git
```

  

2. Install dependancies

  

```bash
npm  install
```

  

3. Copy `.env.example` file and add your private key and RPC URL into .env (RPC is optional but highly encouraged. Visit `https://www.helius.dev/` to get an RPC URL)

  

```bash
cp  .env.example  .env
```

  

This repo consists of 4 main folders, each contains scripts to interact with a type of Meteora pool

These folders are:

- DBC (Dynamic Bonding Curve)

- DAMM V1 (Dynamic AMM V1)

- DAMM V2 (Dynamic AMM V2)

- DLMM (Dynamic Liquidity Market Maker)

  

## Dynamic Bonding Curve (DBC)

The Dynamic Bonding Curve (DBC) program is a permissionless launch pool protocol that allows any launch partners to enable their users to launch tokens with customizable virtual curves directly on their platform (e.g. launchpad). This allows their users to create a new token and create a Dynamic Bonding Curve pool where anyone can buy tokens based on that bonding curve.

The DBC folder contains the scripts to interact with Meteora's Dynamic Bonding Curve. To learn more about the scripts, go to the [DBC README](./dbc/README.md).

  

## Dynamic AMM V1 (DAMM V1)

  

Constant product AMM that supports token prices from 0 to infinity. LPs can earn additional yield by utilizing lending sources alongside traditional swap fees, enhancing their returns.

  

This folder contains all the scripts to interact with Meteora's DAMM V1. To learn more about the scripts, go to the [DAMM V1 README](./damm-v1/README.md).

  

## Dynamic AMM V2 (DAMM V2)

  

Dynamic AMM v2 is a constant-product AMM program, with features that optimize transaction fees and provide greater flexibility for liquidity providers, launchpads, and token launches. DAMM v2 comes with SPL and Token 2022 token support, optional concentrated liquidity, position NFT, dynamic fee, on-chain fee scheduler, new fee claiming mechanism and fee token selection, more flexible liquidity locks, and an in-built farming mechanism. Unlike DAMM v1, DAMM v2 is not integrated with Dynamic Vaults. DAMM v2 is a new program, and not an upgrade of the Dynamic AMM v1 program.

  

This folder contains all the scripts to interact with Meteora's DAMM V2. To learn more about the scripts, go to the [DAMM V2 README](./damm-v2/README.md).

  

## Dynamic Liquidity Market Maker (DLMM)

DLMM (Dynamic Liquidity Market Maker) gives LPs access to dynamic fees to capitalize on volatility, and precise liquidity concentration all in real-time, with the flexibility to select their preferred volatility strategy. 

This folder contains the scripts to create and manage positions on Meteora's DLMM. To learn more about the scripts, go to the [DLMM README](./dlmm/README.md).