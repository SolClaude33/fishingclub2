# 🪙 Coinflip Smart Contract Integration

## Overview

The Penguin Fishing Club now features a real blockchain-based coinflip minigame that integrates with your deployed smart contract on Abstract Chain. Players can connect their wallets and play coinflip games with real ETH stakes.

## Smart Contract Details

- **Contract Address**: `0xcb300ef13a41E27a29674278b4C4D68A506aFf8D`
- **Network**: Abstract Chain (Chain ID: 2741)
- **Contract Type**: `CoinflipOnchainTestOnly` - Test-only coinflip using on-chain pseudo-randomness

### Contract Functions

- `flip(bool _choice)` - Play the coinflip with ETH stake
- `getBalance()` - Get contract balance
- `owner` - Contract owner address
- `withdraw(uint256 amount)` - Owner withdrawal function
- `setOwner(address newOwner)` - Transfer ownership

### Events

- `FlipResult(address player, bool choice, bool result, uint256 amount, bool won)`
- `FundsDeposited(address from, uint256 amount)`
- `FundsWithdrawn(address to, uint256 amount)`

## How It Works

1. **Wallet Connection**: Players connect their MetaMask wallet to the game
2. **Network Validation**: Automatically switches to Abstract Chain (Chain ID: 2741)
3. **Bet Selection**: Choose bet amount (0.001, 0.01, 0.1 ETH or custom)
4. **Side Selection**: Choose Green (true) or Brown (false)
5. **Blockchain Transaction**: Smart contract executes the flip and determines result
6. **Result Display**: Shows win/loss with transaction hash and updates wallet balance

## Game Rules

- **true = Green (Heads)**, **false = Brown (Tails)**
- If player guesses correctly: Win 2x their stake
- If player guesses incorrectly: Stake stays in contract
- Results are determined by on-chain pseudo-randomness (block data + player address)

## Technical Implementation

### Files Modified

1. **`js/plugins/CoinflipMinigame.js`** - Updated plugin with blockchain integration
2. **`game.html`** - Added Web3 libraries (ethers.js and web3.js)
3. **`coinflip-test.html`** - Test page for development and debugging

### Dependencies Added

- **ethers.js v5.7.2** - Primary Web3 library for contract interaction
- **web3.js v1.10.0** - Fallback Web3 library

### Key Features

- **Wallet Integration**: MetaMask connection with network validation
- **Real Transactions**: Actual blockchain transactions with gas fees
- **Event Parsing**: Reads blockchain events for game results
- **Balance Updates**: Real-time wallet balance updates
- **Error Handling**: Comprehensive error handling for failed transactions
- **Responsive UI**: Beautiful, game-themed interface

## Usage Instructions

### For Players

1. **Install MetaMask**: Download and install MetaMask browser extension
2. **Add Abstract Chain**: Network will be added automatically if not present
3. **Connect Wallet**: Click "Connect Wallet" button in the coinflip modal
4. **Select Bet**: Choose your bet amount and side (Green/Brown)
5. **Confirm Transaction**: Approve the transaction in MetaMask
6. **Wait for Result**: Transaction confirmation and result display

### For Developers

1. **Test Integration**: Use `coinflip-test.html` for testing
2. **Debug Transactions**: Check browser console for detailed logs
3. **Customize UI**: Modify styles in the plugin file
4. **Add Features**: Extend functionality as needed

## Testing

### Test Page

Open `coinflip-test.html` in your browser to test:

- Wallet connection
- Contract interaction
- Modal functionality
- Network validation

### Test Commands

```javascript
// Test wallet connection
testWalletConnection();

// Test contract interaction
testContractInteraction();

// Open coinflip modal
openCoinflipModal();
```

## Security Notes

⚠️ **Important**: This contract is marked as "TEST ONLY" because it uses on-chain pseudo-randomness that can be influenced by miners/validators. 

**Not suitable for production use** where real money is at stake.

### Randomness Source

The contract derives randomness from:
- `block.timestamp`
- `block.prevrandao` (PoS difficulty)
- `msg.sender` (player address)
- `address(this).balance` (contract balance)

## Troubleshooting

### Common Issues

1. **MetaMask Not Installed**
   - Install MetaMask browser extension
   - Refresh the page

2. **Wrong Network**
   - Switch to Abstract Chain (Chain ID: 2741)
   - Add network if not present

3. **Transaction Fails**
   - Check wallet balance
   - Ensure sufficient gas fees
   - Verify contract has sufficient funds

4. **Modal Not Opening**
   - Check browser console for errors
   - Verify plugin is loaded correctly

### Debug Information

Check browser console for:
- Wallet connection status
- Contract interaction logs
- Transaction details
- Error messages

## Future Enhancements

### Potential Improvements

1. **VRF Integration**: Use Chainlink VRF for true randomness
2. **Multiplayer Support**: Allow multiple players to bet simultaneously
3. **Tournament Mode**: Create competitive coinflip tournaments
4. **Statistics Tracking**: Track player performance and history
5. **Mobile Optimization**: Improve mobile wallet experience

### Contract Upgrades

1. **Randomness Oracle**: Integrate with external randomness providers
2. **Fee System**: Add platform fees for sustainability
3. **Governance**: Add DAO-style governance for contract parameters
4. **Multi-Chain**: Deploy on additional networks

## Support

For technical support or questions about the integration:

1. Check the browser console for error messages
2. Verify MetaMask is properly configured
3. Ensure you're on the correct network (Abstract Chain)
4. Check contract balance and wallet balance

## License

This integration is part of the Penguin Fishing Club project. The smart contract is licensed under MIT.

---

**Note**: Always test with small amounts first and never risk more than you can afford to lose. This is a test implementation and should not be used for real gambling purposes.
