## DBC Create Config

## Scripts

### Create Config

Creates a new configuration for a Dynamic Bonding Curve pool based on given parameters.
- [Create Config](./src/create-config.ts)

### Create Partner Metadata

Creates partner metadata for the Dynamic Bonding Curve. This allows tokens DBC configs to be associated with a partner and allows tokens that are created with a DBC config to be indexed.
- [Create Partner Metadata](./src/create-partner-metadata.ts)

### Simulate Curve

Simulates DBC curve based on given parameters
- [Simulate Curve](./src/simulate-curve.ts)

## Usage

1. Enter your parameters into the script
	
- [Create Config](./src/create-config.ts)
Configure the curve parameters in the `configKeyParams` object including total token supply, market cap, fee settings, and migration options.

- [Create Partner Metadata](./src/create-partner-metadata.ts)
Update the `createPartnerMetadataParam` object with your partner name, website, logo URL, and fee claimer address.

- [Simulate Curve](./src/simulate-curve.ts)
Modify the `configKeyParams` object to test different curve configurations and see the resulting parameters.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# dbc-create-config
	# dbc-create-partner-metadata
	# dbc-simulate-curve
	```
