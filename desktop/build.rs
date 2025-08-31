use std::env;
use std::fs;
use std::path::Path;

fn main() {
    // Get the output directory
    let out_dir = env::var("OUT_DIR").unwrap();
    let profile = env::var("PROFILE").unwrap();

    // Determine the target directory based on profile
    let target_dir = if profile == "debug" {
        "target/debug"
    } else {
        "target/release"
    };

    // Create target directory if it doesn't exist
    fs::create_dir_all(target_dir).ok();

    // Copy SDL2.dll to the target directory
    let sdl2_dll = "../sdl2/lib/x64/SDL2.dll";
    let target_dll = format!("{}/SDL2.dll", target_dir);

    if Path::new(sdl2_dll).exists() {
        fs::copy(sdl2_dll, target_dll).expect("Failed to copy SDL2.dll");
        println!("cargo:warning=SDL2.dll copied to {}", target_dir);
    } else {
        println!("cargo:warning=SDL2.dll not found at {}", sdl2_dll);
    }

    // Tell cargo to rerun this build script if SDL2.dll changes
    println!("cargo:rerun-if-changed=../sdl2/lib/x64/SDL2.dll");
}
