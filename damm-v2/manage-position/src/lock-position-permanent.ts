import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
  } from "@solana/web3.js";
  import { BN } from "@coral-xyz/anchor";
  import { 
    CpAmm, 
    derivePositionAddress, 
    derivePositionNftAccount,
  } from "@meteora-ag/cp-amm-sdk";
  import {
    getMint,
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  import bs58 from "bs58";
  import "dotenv/config";
  
  
  
  const PAYER_PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY;
  if (!PAYER_PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not set");
  }
  const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
  const payer = Keypair.fromSecretKey(payerSecretKey);
  
  const connection = new Connection(
      process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
  );
  
  async function lockPositionPermanently() {
  
      // Variables to be configured
      const poolAddress = new PublicKey("=");
      const positionNftMint = new PublicKey(""); 
  
      const cpAmm = new CpAmm(connection);
    
      const poolState = await cpAmm.fetchPoolState(poolAddress);
      const tokenAAccountInfo = await connection.getAccountInfo(
        poolState.tokenAMint
      );
    
      let tokenAProgram = TOKEN_PROGRAM_ID;
      let tokenAInfo = undefined;
      if (tokenAAccountInfo?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        tokenAProgram = tokenAAccountInfo.owner;
        const baseMint = await getMint(
          connection,
          poolState.tokenAMint,
          connection.commitment,
          tokenAProgram
        );
        const epochInfo = await connection.getEpochInfo();
        tokenAInfo = {
          mint: baseMint,
          currentEpoch: epochInfo.epoch,
        };
      }
    
      // Lock existing position
      console.log("locking existing position");
    
      const position = derivePositionAddress(positionNftMint);
    
      const permanentLockPositionIx = await cpAmm.permanentLockPosition({
        owner: payer.publicKey,
        position,
        positionNftAccount: derivePositionNftAccount(positionNftMint),
        pool: poolAddress,
        unlockedLiquidity: new BN(1),
      });
    
      // Lock position
      const transaction = new Transaction();
      transaction.add(...permanentLockPositionIx.instructions);
    
      transaction.feePayer = payer.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.sign(...[payer]);
    
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer],
        { commitment: "confirmed" }
      );
    
      console.log({
        position: position.toString(),
        positionNft: positionNftMint.toString(),
        signature,
      });
}
  
lockPositionPermanently()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
  });