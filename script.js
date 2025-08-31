// Chip-8 Emulator Web Version
class Chip8Emulator {
  constructor() {
    this.memory = new Uint8Array(4096)
    this.registers = new Uint8Array(16)
    this.stack = new Uint16Array(16)
    this.screen = new Uint8Array(64 * 32)
    this.pc = 0x200
    this.sp = 0
    this.i = 0
    this.delayTimer = 0
    this.soundTimer = 0
    this.keys = new Uint8Array(16)
    this.running = false
    this.speed = 5

    this.loadFontset()
  }

  loadFontset() {
    const fontset = [
      0xf0,
      0x90,
      0x90,
      0x90,
      0xf0, // 0
      0x20,
      0x60,
      0x20,
      0x20,
      0x70, // 1
      0xf0,
      0x10,
      0xf0,
      0x80,
      0xf0, // 2
      0xf0,
      0x10,
      0xf0,
      0x10,
      0xf0, // 3
      0x90,
      0x90,
      0xf0,
      0x10,
      0x10, // 4
      0xf0,
      0x80,
      0xf0,
      0x10,
      0xf0, // 5
      0xf0,
      0x80,
      0xf0,
      0x90,
      0xf0, // 6
      0xf0,
      0x10,
      0x20,
      0x40,
      0x40, // 7
      0xf0,
      0x90,
      0xf0,
      0x90,
      0xf0, // 8
      0xf0,
      0x90,
      0xf0,
      0x10,
      0xf0, // 9
      0xf0,
      0x90,
      0xf0,
      0x90,
      0x90, // A
      0xe0,
      0x90,
      0xe0,
      0x90,
      0xe0, // B
      0xf0,
      0x80,
      0x80,
      0x80,
      0xf0, // C
      0xe0,
      0x90,
      0x90,
      0x90,
      0xe0, // D
      0xf0,
      0x80,
      0xf0,
      0x80,
      0xf0, // E
      0xf0,
      0x80,
      0xf0,
      0x80,
      0x80 // F
    ]

    for (let i = 0; i < fontset.length; i++) {
      this.memory[i] = fontset[i]
    }
  }

  loadROM(romData) {
    for (let i = 0; i < romData.length; i++) {
      this.memory[0x200 + i] = romData[i]
    }
    this.reset()
  }

  reset() {
    this.pc = 0x200
    this.sp = 0
    this.i = 0
    this.delayTimer = 0
    this.soundTimer = 0
    this.registers.fill(0)
    this.screen.fill(0)
    this.keys.fill(0)
  }

  step() {
    if (!this.running) return

    const opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1]
    // Only log first few steps to avoid console spam
    if (this.pc < 0x220) {
      console.log(
        `Step: PC=${this.pc.toString(16).padStart(4, '0')}, Opcode=0x${opcode
          .toString(16)
          .padStart(4, '0')}`
      )
    }

    this.execute(opcode)
    this.pc += 2

    if (this.delayTimer > 0) this.delayTimer--
    if (this.soundTimer > 0) this.soundTimer--
  }

  execute(opcode) {
    const x = (opcode & 0x0f00) >> 8
    const y = (opcode & 0x00f0) >> 4
    const n = opcode & 0x000f
    const nn = opcode & 0x00ff
    const nnn = opcode & 0x0fff

    // Only log first few executions to avoid console spam
    if (this.pc < 0x220) {
      console.log(
        `Executing opcode: 0x${opcode.toString(16).padStart(4, '0')} at PC: 0x${this.pc
          .toString(16)
          .padStart(4, '0')}`
      )
    }

    switch (opcode & 0xf000) {
      case 0x0000:
        if (opcode === 0x00e0) this.clearScreen()
        else if (opcode === 0x00ee) this.ret()
        else console.log(`Unknown opcode: 0x${opcode.toString(16).padStart(4, '0')}`)
        break
      case 0x1000:
        this.pc = nnn
        break
      case 0x2000:
        this.call(nnn)
        break
      case 0x3000:
        if (this.registers[x] === nn) this.pc += 2
        break
      case 0x4000:
        if (this.registers[x] !== nn) this.pc += 2
        break
      case 0x5000:
        if (this.registers[x] === this.registers[y]) this.pc += 2
        break
      case 0x6000:
        this.registers[x] = nn
        break
      case 0x7000:
        this.registers[x] += nn
        break
      case 0x8000:
        this.execute8xy(opcode, x, y, n)
        break
      case 0x9000:
        if (this.registers[x] !== this.registers[y]) this.pc += 2
        break
      case 0xa000:
        this.i = nnn
        break
      case 0xb000:
        this.pc = this.registers[0] + nnn
        break
      case 0xc000:
        this.registers[x] = Math.floor(Math.random() * 256) & nn
        break
      case 0xd000:
        this.draw(x, y, n)
        break
      case 0xe000:
        this.executeExy(opcode, x, nn)
        break
      case 0xf000:
        this.executeFxy(opcode, x, nn)
        break
      default:
        console.log(`Unhandled opcode: 0x${opcode.toString(16).padStart(4, '0')}`)
    }
  }

  execute8xy(opcode, x, y, n) {
    switch (n) {
      case 0x0:
        this.registers[x] = this.registers[y]
        break
      case 0x1:
        this.registers[x] |= this.registers[y]
        break
      case 0x2:
        this.registers[x] &= this.registers[y]
        break
      case 0x3:
        this.registers[x] ^= this.registers[y]
        break
      case 0x4:
        this.add(x, y)
        break
      case 0x5:
        this.sub(x, y)
        break
      case 0x6:
        this.shr(x)
        break
      case 0x7:
        this.subn(x, y)
        break
      case 0xe:
        this.shl(x)
        break
    }
  }

  executeExy(opcode, x, nn) {
    if (nn === 0x9e && this.keys[this.registers[x]]) this.pc += 2
    else if (nn === 0xa1 && !this.keys[this.registers[x]]) this.pc += 2
  }

  executeFxy(opcode, x, nn) {
    switch (nn) {
      case 0x07:
        this.registers[x] = this.delayTimer
        break
      case 0x0a:
        this.waitForKey(x)
        break
      case 0x15:
        this.delayTimer = this.registers[x]
        break
      case 0x18:
        this.soundTimer = this.registers[x]
        break
      case 0x1e:
        this.i += this.registers[x]
        break
      case 0x29:
        this.i = this.registers[x] * 5
        break
      case 0x33:
        this.storeBCD(x)
        break
      case 0x55:
        this.storeRegisters(x)
        break
      case 0x65:
        this.loadRegisters(x)
        break
    }
  }

  add(x, y) {
    const sum = this.registers[x] + this.registers[y]
    this.registers[0xf] = sum > 255 ? 1 : 0
    this.registers[x] = sum & 0xff
  }

  sub(x, y) {
    this.registers[0xf] = this.registers[x] >= this.registers[y] ? 1 : 0
    this.registers[x] = this.registers[x] - this.registers[y]
  }

  subn(x, y) {
    this.registers[0xf] = this.registers[y] >= this.registers[x] ? 1 : 0
    this.registers[x] = this.registers[y] - this.registers[x]
  }

  shr(x) {
    this.registers[0xf] = this.registers[x] & 1
    this.registers[x] >>= 1
  }

  shl(x) {
    this.registers[0xf] = (this.registers[x] & 0x80) >> 7
    this.registers[x] <<= 1
  }

  draw(x, y, n) {
    this.registers[0xf] = 0
    const xPos = this.registers[x] % 64
    const yPos = this.registers[y] % 32

    for (let row = 0; row < n; row++) {
      const sprite = this.memory[this.i + row]
      for (let col = 0; col < 8; col++) {
        if (sprite & (0x80 >> col)) {
          const screenX = (xPos + col) % 64
          const screenY = (yPos + row) % 32
          const index = screenY * 64 + screenX

          if (this.screen[index]) {
            this.registers[0xf] = 1
          }
          this.screen[index] ^= 1
        }
      }
    }
  }

  clearScreen() {
    this.screen.fill(0)
  }

  call(address) {
    this.stack[this.sp] = this.pc
    this.sp++
    this.pc = address
  }

  ret() {
    this.sp--
    this.pc = this.stack[this.sp]
  }

  waitForKey(x) {
    // For now, just continue without waiting
    // This is a simplified implementation
    console.log(`Waiting for key in register ${x}`)
  }

  storeBCD(x) {
    const value = this.registers[x]
    this.memory[this.i] = Math.floor(value / 100)
    this.memory[this.i + 1] = Math.floor((value % 100) / 10)
    this.memory[this.i + 2] = value % 10
  }

  storeRegisters(x) {
    for (let i = 0; i <= x; i++) {
      this.memory[this.i + i] = this.registers[i]
    }
  }

  loadRegisters(x) {
    for (let i = 0; i <= x; i++) {
      this.registers[i] = this.memory[this.i + i]
    }
  }

  setKey(key, pressed) {
    this.keys[key] = pressed ? 1 : 0
  }

  getScreen() {
    return this.screen
  }
}

// ROM data - converted from actual ROM files
const ROMS = {
  MAZE: typeof MAZE_ROM !== 'undefined' ? MAZE_ROM : new Uint8Array([]),
  PONG: typeof PONG_ROM !== 'undefined' ? PONG_ROM : new Uint8Array([]),
  TETRIS: typeof TETRIS_ROM !== 'undefined' ? TETRIS_ROM : new Uint8Array([]),
  INVADERS: typeof INVADERS_ROM !== 'undefined' ? INVADERS_ROM : new Uint8Array([]),
  BLINKY: typeof BLINKY_ROM !== 'undefined' ? BLINKY_ROM : new Uint8Array([]),
  '15PUZZLE': typeof PUZZLE15_ROM !== 'undefined' ? PUZZLE15_ROM : new Uint8Array([]),
  CONNECT4: typeof CONNECT4_ROM !== 'undefined' ? CONNECT4_ROM : new Uint8Array([]),
  GUESS: typeof GUESS_ROM !== 'undefined' ? GUESS_ROM : new Uint8Array([])
}

// Main application
let emulator
let canvas, ctx
let animationId
let lastTime = 0

function init() {
  console.log('Initializing Chip-8 Emulator...')

  // Check if ROM variables are available
  console.log('ROM variables check:')
  console.log('MAZE_ROM:', typeof MAZE_ROM !== 'undefined' ? 'Available' : 'Missing')
  console.log('PONG_ROM:', typeof PONG_ROM !== 'undefined' ? 'Available' : 'Missing')
  console.log('TETRIS_ROM:', typeof TETRIS_ROM !== 'undefined' ? 'Available' : 'Missing')

  emulator = new Chip8Emulator()
  console.log('Emulator created:', emulator)

  canvas = document.getElementById('screen')
  ctx = canvas.getContext('2d')
  console.log('Canvas context:', ctx)

  setupEventListeners()
  render()

  console.log('Initialization complete!')
  console.log('Available ROMs:', Object.keys(ROMS))
  console.log('ROMS object:', ROMS)
}

function setupEventListeners() {
  console.log('Setting up event listeners...')

  const loadRomBtn = document.getElementById('load-rom')
  const startBtn = document.getElementById('start')
  const pauseBtn = document.getElementById('pause')
  const resetBtn = document.getElementById('reset')
  const speedSlider = document.getElementById('speed')

  console.log('Found elements:', { loadRomBtn, startBtn, pauseBtn, resetBtn, speedSlider })

  loadRomBtn.addEventListener('click', loadROM)
  startBtn.addEventListener('click', start)
  pauseBtn.addEventListener('click', pause)
  resetBtn.addEventListener('click', reset)
  speedSlider.addEventListener('input', updateSpeed)

  console.log('Event listeners attached!')

  // Keyboard controls
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  // On-screen keyboard
  document.querySelectorAll('.key').forEach((key) => {
    key.addEventListener('mousedown', () => handleKeyDown({ key: key.dataset.key }))
    key.addEventListener('mouseup', () => handleKeyUp({ key: key.dataset.key }))
  })
}

function loadROM() {
  const romSelect = document.getElementById('rom-select')
  const selectedROM = romSelect.value

  console.log('Loading ROM:', selectedROM)
  console.log('Available ROMs:', Object.keys(ROMS))
  console.log('Selected ROM data:', ROMS[selectedROM])

  if (selectedROM && ROMS[selectedROM] && ROMS[selectedROM].length > 0) {
    emulator.loadROM(ROMS[selectedROM])
    console.log(`Loaded ${selectedROM} ROM with ${ROMS[selectedROM].length} bytes`)
  } else {
    console.error(`Failed to load ROM: ${selectedROM}`)
    alert(`Failed to load ROM: ${selectedROM}. Check console for details.`)
  }
}

function start() {
  console.log('Start button clicked!')

  // Check if a ROM is loaded
  if (emulator.pc === 0x200) {
    console.log('No ROM loaded! Please load a ROM first.')
    alert('Please load a ROM first before starting the emulator.')
    return
  }

  if (!emulator.running) {
    emulator.running = true
    console.log('Starting emulator...')
    gameLoop()
  } else {
    console.log('Emulator already running')
  }
}

function pause() {
  emulator.running = false
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
}

function reset() {
  pause()
  emulator.reset()
  render()
}

function updateSpeed() {
  const speedSlider = document.getElementById('speed')
  const speedValue = document.getElementById('speed-value')
  emulator.speed = parseInt(speedSlider.value)
  speedValue.textContent = `${emulator.speed}x`
}

function gameLoop(currentTime = 0) {
  if (!emulator.running) {
    console.log('Game loop stopped - emulator not running')
    return
  }

  const deltaTime = currentTime - lastTime
  const targetTime = 1000 / (60 * emulator.speed)

  if (deltaTime >= targetTime) {
    emulator.step()
    render()
    lastTime = currentTime
  }

  animationId = requestAnimationFrame(gameLoop)
}

function render() {
  const screen = emulator.getScreen()
  const imageData = ctx.createImageData(64, 32)

  for (let i = 0; i < screen.length; i++) {
    const pixel = screen[i] ? 255 : 0
    const index = i * 4
    imageData.data[index] = pixel // R
    imageData.data[index + 1] = pixel // G
    imageData.data[index + 2] = pixel // B
    imageData.data[index + 3] = 255 // A
  }

  ctx.putImageData(imageData, 0, 0)
  // Only log first few renders to avoid console spam
  if (emulator.pc < 0x220) {
    console.log('Rendered frame')
  }
}

function handleKeyDown(event) {
  const keyMap = {
    1: 0x1,
    2: 0x2,
    3: 0x3,
    4: 0xc,
    q: 0x4,
    w: 0x5,
    e: 0x6,
    r: 0xd,
    a: 0x7,
    s: 0x8,
    d: 0x9,
    f: 0xe,
    z: 0xa,
    x: 0x0,
    c: 0xb,
    v: 0xf
  }

  const key = keyMap[event.key.toLowerCase()]
  if (key !== undefined) {
    emulator.setKey(key, true)
    updateKeyVisual(key, true)
  }
}

function handleKeyUp(event) {
  const keyMap = {
    1: 0x1,
    2: 0x2,
    3: 0x3,
    4: 0xc,
    q: 0x4,
    w: 0x5,
    e: 0x6,
    r: 0xd,
    a: 0x7,
    s: 0x8,
    d: 0x9,
    f: 0xe,
    z: 0xa,
    x: 0x0,
    c: 0xb,
    v: 0xf
  }

  const key = keyMap[event.key.toLowerCase()]
  if (key !== undefined) {
    emulator.setKey(key, false)
    updateKeyVisual(key, false)
  }
}

function updateKeyVisual(key, pressed) {
  const keyElement = document.querySelector(`[data-key="${key.toString(16).toUpperCase()}"]`)
  if (keyElement) {
    keyElement.classList.toggle('active', pressed)
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure all ROM scripts are loaded
  setTimeout(init, 100)
})
