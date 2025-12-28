import { Connection, PublicKey } from "@solana/web3.js";

const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Singleton connection
let connection: Connection | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_ENDPOINT, 'confirmed');
  }
  return connection;
}

export const onchainApi = {
  getConnection,
  
  getBalance: async (address: string): Promise<number> => {
    if (!address) return 0;
    try {
      const conn = getConnection();
      const pubKey = new PublicKey(address);
      const lamports = await conn.getBalance(pubKey);
      return lamports / 1e9;
    } catch (e) {
      console.error('Onchain API Error (getBalance):', e);
      return 0;
    }
  },

  getTokenAccounts: async (ownerAddress: string) => {
    if (!ownerAddress) return [];
    try {
       const conn = getConnection();
       const pubKey = new PublicKey(ownerAddress);
       const response = await conn.getParsedTokenAccountsByOwner(pubKey, {
         programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
       });
       return response.value.map(item => ({
         mint: item.account.data.parsed.info.mint,
         amount: item.account.data.parsed.info.tokenAmount.uiAmount,
         decimals: item.account.data.parsed.info.tokenAmount.decimals
       }));
    } catch (e) {
      console.error('Onchain API Error (getTokenAccounts):', e);
      return [];
    }
  }
};
