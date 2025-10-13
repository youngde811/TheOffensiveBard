//! Insult generation and output functionality.

use crate::error::InsultError;
use crate::parser::PhraseList;
use rand::prelude::*;
use serde_json::json;
use std::fs::File;
use std::io::Write;

/// Generate and print insults to stdout
pub fn print_insults(phrases: &PhraseList, count: u16) {
    let mut rng = thread_rng();
    
    (0..count).for_each(|_| {
        if let Some(phrase) = phrases.choose(&mut rng) {
            println!("Thou {} {} {}!", phrase[0], phrase[1], phrase[2]);
        }
    });
}

/// Generate all insults as JSON and write to file
pub fn write_insults_json(phrases: &PhraseList, genfile: &str) -> Result<(), InsultError> {
    let mut file = File::create(genfile)?;
    
    let payload = json!({
        "phrases": phrases
    });
    
    let json_string = serde_json::to_string_pretty(&payload)?;
    file.write_all(json_string.as_bytes())?;
    
    Ok(())
}
