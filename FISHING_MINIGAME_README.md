# Enhanced Fishing Minigame System

## Overview
The fishing system has been completely upgraded from a simple click-to-fish mechanic to an engaging, skill-based minigame that requires timing and precision.

## How to Play

### Basic Mechanics
1. **Approach a fishing spot** - Look for areas near water with fishing events
2. **Interact with the spot** - Press Enter or click on the fishing spot
3. **The minigame begins** - A progress bar appears with a moving fish and target zone
4. **Time your click** - Click when the fish is in the yellow target zone
5. **Score matters** - Better timing = higher score = better rewards

### Visual Elements
- **Blue Progress Bar** - The main fishing area
- **Moving Fish** - A cyan fish that moves back and forth
- **Yellow Target Zone** - The area where you need to click to catch the fish
- **Timer** - Shows remaining time at the top
- **Score Display** - Shows your current score at the bottom

### Gameplay
- **Fish Movement**: The fish moves back and forth across the progress bar
- **Target Zone**: The yellow area indicates where you should click
- **Timing**: Click when the fish is inside the yellow zone
- **Accuracy**: The closer to the center of the target zone, the higher your score
- **Time Limit**: Each fish has a different time limit based on difficulty

## Difficulty Levels

### Easy Fish (Mackerel, Anchovy)
- **Fish Speed**: Slow movement
- **Target Size**: Large yellow zone (80px)
- **Time Limit**: 10 seconds
- **Catch Rate**: 90% base chance

### Normal Fish (Salmon, Trout)
- **Fish Speed**: Medium movement
- **Target Size**: Medium yellow zone (60px)
- **Time Limit**: 8 seconds
- **Catch Rate**: 75% base chance

### Hard Fish (Treasure)
- **Fish Speed**: Fast movement
- **Target Size**: Small yellow zone (40px)
- **Time Limit**: 6 seconds
- **Catch Rate**: 60% base chance

## Fish Types and Rarities

| Fish Type | Difficulty | Rarity | Base Value |
|-----------|------------|--------|------------|
| Mackerel  | Easy       | 40%    | 10 coins   |
| Anchovy   | Easy       | 35%    | 8 coins    |
| Salmon    | Normal     | 20%    | 25 coins   |
| Trout     | Normal     | 15%    | 20 coins   |
| Treasure  | Hard       | 5%     | 100 coins  |

## Controls
- **Enter Key** or **Mouse Click**: Attempt to catch the fish
- **ESC**: Cannot exit during minigame (must complete or timeout)

## Scoring System
- **Perfect Catch**: 100 points (fish exactly in center of target)
- **Good Catch**: 80-99 points (fish near center)
- **Average Catch**: 60-79 points (fish in target zone)
- **Miss**: 0 points (fish outside target zone)

## Tips for Success
1. **Watch the fish pattern** - Learn how it moves
2. **Anticipate the movement** - Don't click where the fish is, click where it will be
3. **Practice timing** - Start with easy fish to get the hang of it
4. **Stay calm** - Don't rush your clicks
5. **Focus on the target zone** - The yellow area is your friend

## Technical Details
- The minigame automatically replaces the old random fishing system
- All existing fishing spots now use the new minigame
- Fish selection is based on rarity percentages
- Difficulty affects fish speed, target size, and time limit
- Successful catches add fish to your inventory automatically

## Troubleshooting
- If the minigame doesn't start, make sure the plugin is enabled in plugins.js
- If you're still getting the old fishing system, try refreshing the game
- The minigame requires proper timing - practice makes perfect!

Enjoy your enhanced fishing experience! 🎣
