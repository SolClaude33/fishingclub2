//=============================================================================
// AGW + RainbowKit Configuration
//=============================================================================

// Configuration for Abstract Global Wallet + RainbowKit integration
window.AGWRainbowKitConfig = {
    // WalletConnect Project ID
    projectId: '67c0edae1f9b9919fa118e211f2535a1',
    
    // Supported chains - Solo Abstract Mainnet
    chains: [
        {
            id: 8333,
            name: 'Abstract Mainnet',
            network: 'abstract',
            nativeCurrency: { name: 'Abstract Token', symbol: 'ABS', decimals: 18 },
            rpcUrls: {
                default: 'https://api.abs.xyz',
                public: 'https://api.abs.xyz'
            },
            blockExplorers: {
                default: { name: 'Abstract Explorer', url: 'https://explorer.abs.xyz' }
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
