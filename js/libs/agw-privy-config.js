// Configuration for Abstract Global Wallet + Privy integration
window.AGWPrivyConfig = {
    // Privy App ID - Replace with your actual Privy App ID
    privyAppId: 'cm04asygd041fmry9zmcyn5o5',
    
    // Abstract Mainnet configuration
    chainId: 2741,
    rpcUrl: 'https://api.mainnet.abs.xyz',
    
    // App configuration
    appName: 'Penguin Fishing Club',
    appDescription: 'A Web3 fishing game with Abstract Global Wallet integration',
    appUrl: window.location.origin,
    appIcon: `${window.location.origin}/logo.png`,
    
    // Privy configuration
    privyConfig: {
        appearance: {
            theme: 'light',
            accentColor: '#8B4513',
            logo: `${window.location.origin}/logo.png`
        },
        embeddedWallets: {
            createOnLogin: 'users-without-wallets'
        }
    }
};
