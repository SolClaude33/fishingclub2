//=============================================================================
// AGW + RainbowKit Configuration
//=============================================================================

// Configuration for Abstract Global Wallet + RainbowKit integration
window.AGWRainbowKitConfig = {
    // WalletConnect Project ID (replace with your actual project ID)
    projectId: 'your-walletconnect-project-id',
    
    // Supported chains
    chains: [
        {
            id: 1,
            name: 'Ethereum Mainnet',
            network: 'homestead',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
                default: 'https://eth.llamarpc.com',
                public: 'https://eth.llamarpc.com'
            },
            blockExplorers: {
                default: { name: 'Etherscan', url: 'https://etherscan.io' }
            }
        },
        {
            id: 8453,
            name: 'Base',
            network: 'base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
                default: 'https://mainnet.base.org',
                public: 'https://mainnet.base.org'
            },
            blockExplorers: {
                default: { name: 'BaseScan', url: 'https://basescan.org' }
            }
        }
    ],
    
    // App configuration
    appName: 'Penguin Fishing Club',
    appDescription: 'A Web3 fishing game with multi-wallet support',
    appUrl: window.location.origin,
    
    // Theme configuration
    theme: {
        mode: 'dark',
        colors: {
            primary: '#3b82f6',
            secondary: '#10b981',
            accent: '#f59e0b',
            background: '#1f2937',
            surface: '#374151',
            text: '#ffffff'
        }
    }
};

console.log('AGW + RainbowKit configuration loaded');
