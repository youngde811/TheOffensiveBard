//! # Shakespearean Insult Generator
//!
//! A Rust library and CLI tool for generating creative Shakespearean-style insults
//! by combining period-appropriate adjectives and nouns.
//!
//! ## Features
//!
//! - **Embedded phrases**: No external files required for basic operation
//! - **Custom phrase files**: Support for user-provided phrase collections
//! - **Multiple output formats**: Console output or JSON export
//! - **Zero-cost abstractions**: Compile-time resource embedding
//! - **Robust error handling**: Comprehensive error types with helpful messages
//!
//! ## Quick Start
//!
//! ```rust
//! use gin::generator::print_insults;
//! use gin::parser::read_phrases;
//!
//! let phrases = read_phrases("data/phrases", EMBEDDED_DATA, "data/phrases")?;
//! print_insults(&phrases, 3);
//! ```
//! ## Try it Out
//!
//! ```shell
//! cargo build
//! cargo run -- -c 5
//! Thou puking knotty-pated malt-worm!
//! Thou loggerheaded half-faced hedge-pig!
//! Thou dissembling dizzy-eyed coxcomb!
//! Thou ruttish pox-marked mumble-news!
//! Thou infectious full-gorged haggard!
//! ```
//! You should see five creative insults in Shakespearean style, similar
//! to the above!
//!
//! For the available command-line arguments, run one of:
//! ```shell
//! cargo run -- -h
//! cargo run -- --help
//! ```
//!
//! ## Architecture
//!
//! The crate is organized into focused modules:
//! - [`error`] - Custom error types and trait implementations
//! - [`parser`] - File parsing and data processing logic  
//! - [`generator`] - Insult generation and output formatting
//!
//! Many thanks to Windsurf's Claude-4 AI for helping me clean up my initial version of this
//! code.

use clap::Parser;
use tikv_jemallocator::Jemalloc;

mod error;
mod parser;
mod generator;

use error::InsultError;
use parser::{read_phrases};
use generator::{print_insults, write_insults_json};

#[global_allocator]
static GLOBAL: Jemalloc = Jemalloc;

// Constants
const MAX_INSULTS: u16 = 500;
const MIN_INSULTS: u16 = 1;
const DEFAULT_PHRASES_FILE: &str = "data/phrases";

// Embed the default phrases file at compile time. This feature is
// similar to Lisp's EVAL-WHEN special form, and is of great utility.
const EMBEDDED_PHRASES: &str = include_str!("../data/phrases");

#[derive(Parser, Debug)]
#[command(version, about)]
#[command(about = "A Shakespearean insult generator")]
#[command(long_about = r#"A Shakespearean insult generator.

This program generates creative Shakespearean-style insults by combining
adjectives and nouns from a curated list of period-appropriate terms.

Examples:
  genrust                   # Generate one insult
  genrust -c 5              # Generate five insults  
  genrust -p custom.txt     # Use custom phrases file
  genrust -g output.json    # Generate all combinations to JSON file

The default phrases are embedded in the executable, so no external
files are required for basic operation."#)]
struct Args {
    /// the number of insults to generate
    ///
    /// if not provided, the default is 1
    #[clap(short = 'c', long, default_value_t = MIN_INSULTS)]
    #[arg(value_parser = clap::value_parser!(u16).range(MIN_INSULTS as i64..=MAX_INSULTS as i64))]
    count: u16,

    /// the location of the phrases source file
    ///
    /// if not provided, the default is "data/phrases"
    #[clap(short, long, default_value = DEFAULT_PHRASES_FILE)]
    phrases: String,

    /// generate a complete set of insults, in JSON, and write them to GENFILE
    ///
    /// if not provided, insults go to stdout
    #[clap(short, long, default_value = "")]
    genfile: String,
}

fn run() -> Result<(), InsultError> {
    let args = Args::parse();

    let phrases = read_phrases(&args.phrases, EMBEDDED_PHRASES, DEFAULT_PHRASES_FILE)?;
    
    if !args.genfile.is_empty() {
        write_insults_json(&phrases, &args.genfile)?;
        println!("Generated {} phrases to {}", phrases.len(), args.genfile);
    } else {
        print_insults(&phrases, args.count);
    }
    
    Ok(())
}

fn main() {
    if let Err(e) = run() {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}
