import { createAppKit } from '@reown/appkit/react';
import { arbitrum, mainnet, polygon } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

const metadata = {
  name: 'Telegram Contacts POC',
  description: 'Crypto Wallet + Telegram Contact Retrieval',
  url: 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const networks = [mainnet, arbitrum, polygon];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

export const config = wagmiAdapter.wagmiConfig;

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
});