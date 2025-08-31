# Chip-8 Emulator

A web-based Chip-8 emulator that runs classic games from the 1970s. The emulator is written in JavaScript for web compatibility.

## Features

- **Full Chip-8 Instruction Set**: Implements all 35 Chip-8 instructions
- **Multiple ROMs**: Includes classic games like PONG, TETRIS, INVADERS, MAZE, and more
- **Web Interface**: Modern, responsive web interface with on-screen controls
- **Speed Control**: Adjustable emulation speed from 1x to 10x
- **Keyboard Support**: Both on-screen and physical keyboard input

## Available Games

- **MAZE**: Simple maze game
- **PONG**: Classic Pong game
- **TETRIS**: Tetris-style falling blocks
- **INVADERS**: Space Invaders-style game
- **BLINKY**: Pac-Man style game
- **15 PUZZLE**: Sliding number puzzle
- **CONNECT 4**: Connect Four game
- **GUESS**: Number guessing game

## How to Use

1. **Select a ROM**: Choose a game from the dropdown menu
2. **Load ROM**: Click "Load ROM" to load the selected game
3. **Start Playing**: Click "Start" to begin the game
4. **Controls**: Use the on-screen keyboard or your computer's number keys:
   - `1`, `2`, `3`, `4` - Top row
   - `Q`, `W`, `E`, `R` - Second row
   - `A`, `S`, `D`, `F` - Third row
   - `Z`, `X`, `C`, `V` - Bottom row

## Local Development

To run the emulator locally:

```bash
# Start a local web server
python -m http.server 8000

# Or use Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch**: Any push to the main/master branch triggers automatic deployment
2. **GitHub Actions**: Uses GitHub Actions workflow for deployment
3. **Live URL**: Your emulator will be available at `https://yourusername.github.io/emulator`

### Manual Deployment

To manually trigger deployment:

1. Go to your repository's Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Project Structure

```
├── index.html          # Main HTML file
├── style.css           # CSS styling
├── script.js           # Main emulator logic
├── roms/               # Converted ROM files
│   ├── maze.js
│   ├── pong.js
│   ├── tetris.js
│   └── ...
├── desktop/            # Desktop version (Rust)
├── chip8_core/         # Core emulator library
└── .github/workflows/  # GitHub Actions configuration
```

## ROM Conversion

ROM files are converted from binary to JavaScript arrays using the included conversion script:

```bash
node convert-roms.js
```

This converts ROMs from `desktop/roms/` to `roms/*.js` files.

## Technical Details

- **Language**: JavaScript (ES6+)
- **Graphics**: HTML5 Canvas with pixel-perfect rendering
- **Input**: Keyboard and mouse support
- **Architecture**: Object-oriented design with clean separation of concerns
- **Performance**: Optimized rendering loop with configurable speed

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use, modify, and distribute as you see fit.

## Acknowledgments

- Original Chip-8 specification and documentation
- Classic ROM creators and contributors
- Web development community for best practices
