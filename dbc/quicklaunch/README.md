# Dynamic Bonding Curve Quicklaunch

The Dynamic Bonding Curve Quicklaunch provides a simple way to launch tokens when using the default setup or an existing config key.


## Getting Started

1. Clone the repository

```bash
git clone https://github.com/MeteoraAg/meteora-studio.git
```

2. Change directory to the `dbc/quickstart` folder

```bash
cd meteora-studio/dbc/quicklaunch
```

3. Copy `.env.example` file and add your private key and RPC URL into .env (RPC is optional but highly encouraged. Visit `https://www.helius.dev/` to get an RPC URL)

Note: Private key owner will be the owner of the token
```bash
cp .env.example .env
```

4. Install dependencies

```bash
npm install
```

5. Edit the token name, ticker and image in src/index.ts. If you want to use a custom config key, edit `configKey' to your custom key

6. Run the script to launch a token

```bash
npm run dbc
```


