const FONTSET_SIZE: usize = 80;
const FONTSET: [u8; FONTSET_SIZE] = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80, // F
];

pub const SCREEN_WIDTH: usize = 64;
pub const SCREEN_HEIGHT: usize = 32;

const RAM_SIZE: usize = 4096;
const REGISTERS_QUANTITY: usize = 16;
const STACK_SIZE: usize = 16;
const KEYS_QUANTITY: usize = 16;

pub struct Emulator {
    pc: u16,
    ram: [u8; RAM_SIZE],
    screen: [bool; SCREEN_WIDTH * SCREEN_HEIGHT],
    registers: [u8; REGISTERS_QUANTITY],
    i_register: u16,
    stack: [u16; STACK_SIZE],
    stack_pointer: u16,
    delay_timer: u8,
    sound_timer: u8,
    keys: [bool; KEYS_QUANTITY],
}

const INITIAL_ADDRESS: u16 = 0x200;

impl Emulator {
    pub fn new() -> Self {
        let mut new_emulator = Self {
            pc: INITIAL_ADDRESS,
            ram: [0; RAM_SIZE],
            screen: [false; SCREEN_WIDTH * SCREEN_HEIGHT],
            registers: [0; REGISTERS_QUANTITY],
            i_register: 0,
            stack: [0; STACK_SIZE],
            stack_pointer: 0,
            delay_timer: 0,
            sound_timer: 0,
            keys: [false; KEYS_QUANTITY],
        };

        new_emulator.ram[..FONTSET_SIZE].copy_from_slice(&FONTSET);

        new_emulator
    }

    fn read_byte_from_ram(&self, address: u16) -> u8 {
        if address >= RAM_SIZE as u16 {
            panic!("Address out of bounds when reading from RAM");
        }
        self.ram[address as usize]
    }

    fn write_byte_to_ram(&mut self, address: u16, value: u8) {
        if address >= RAM_SIZE as u16 {
            panic!("Address out of bounds when writing to RAM");
        }
        self.ram[address as usize] = value;
    }

    pub fn push_to_stack(&mut self, value: u16) {
        if self.stack_pointer >= STACK_SIZE as u16 {
            panic!("Stack overflow when pushing to stack");
        }
        self.stack[self.stack_pointer as usize] = value;
        self.stack_pointer += 1;
    }

    pub fn pop_from_stack(&mut self) -> u16 {
        if self.stack_pointer == 0 {
            panic!("Stack underflow when popping from stack");
        }
        self.stack_pointer -= 1;
        self.stack[self.stack_pointer as usize]
    }

    fn increment_pc(&mut self) {
        if self.pc + 2 >= RAM_SIZE as u16 {
            panic!("Program counter out of bounds");
        }
        self.pc += 2;
    }

    fn set_pc(&mut self, address: u16) {
        if address >= RAM_SIZE as u16 {
            panic!("Program counter out of bounds");
        }
        self.pc = address;
    }

    pub fn reset(&mut self) {
        *self = Emulator::new();
    }

    pub fn tick(&mut self) {
        let op = self.fetch();

        self.execute(op);
    }

    fn execute(&mut self, op: u16) {
        let (x, y, n, nn) = self.extract_instruction_parameters(op);

        match (x, y, n, nn) {
            (0, 0, 0, 0) => return,
            (0, 0, 0xE, 0) => self.clear_screen(),
            (0, 0, 0xE, 1) => self.return_from_subroutine(),
            (1, _, _, _) => self.set_pc((op & 0x0FFF) as u16),

            (_, _, _, _) => unimplemented!("This instruction is not implemented yet: {:#04x}", op),
        }
    }
    fn extract_instruction_parameters(&self, op: u16) -> (usize, usize, u8, u8) {
        let x = ((op & 0x0F00) >> 8) as usize;
        let y = ((op & 0x00F0) >> 4) as usize;
        let n = (op & 0x000F) as u8;
        let nn = (op & 0x00FF) as u8;
        (x, y, n, nn)
    }

    fn fetch(&mut self) -> u16 {
        let high_byte = self.read_byte_from_ram(self.pc) as u16;
        let low_byte = self.read_byte_from_ram(self.pc + 1) as u16;
        let op = (high_byte << 8) | low_byte;
        self.increment_pc();
        op
    }

    pub fn tick_timer(&mut self) {
        if self.delay_timer > 0 {
            self.delay_timer -= 1;
        }

        if self.sound_timer > 0 {
            if self.sound_timer == 1 {
                //make sound
            }
            self.sound_timer -= 1;
        }
    }

    fn clear_screen(&mut self) {
        self.screen = [false; SCREEN_WIDTH * SCREEN_HEIGHT];
    }

    fn return_from_subroutine(&mut self) {
        let return_address = self.pop_from_stack();
        self.set_pc(return_address);
    }
}
