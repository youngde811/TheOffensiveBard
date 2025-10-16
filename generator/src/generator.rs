//! Insult generation and output functionality.

use crate::error::InsultError;
use crate::parser::PhraseList;
use rand::prelude::*;
use serde::{Serialize, Deserialize};
use serde_json::json;
use std::fs::File;
use std::io::Write;

#[derive(Serialize, Deserialize)]
struct Insult {
    id: usize,
    insult: String,
}

/// Generate and print insults to stdout
pub fn print_insults(phrases: &PhraseList, count: u32) {
    let mut rng = thread_rng();

    (0..count).for_each(|_| {
        if let Some(phrase) = phrases.choose(&mut rng) {
            println!("Thou {} {} {}!", phrase[0], phrase[1], phrase[2]);
        }
    });
}

/// Generate all insult combinations as JSON and write to file
/// Creates JSON format: { "insults": [{ "id": 0, "insult": "..." }, ...] }
///
/// With N phrases, generates N³ combinations by taking one word from each column
pub fn write_insults_json(phrases: &PhraseList, genfile: &str) -> Result<(), InsultError> {
    let mut file = File::create(genfile)?;

    // Generate all combinations: for each adj1 × adj2 × noun
    let mut insults = Vec::new();
    let mut id = 0;

    for phrase1 in phrases {
        for phrase2 in phrases {
            for phrase3 in phrases {
                let insult_text = format!(
                    "Thou {} {} {}!",
                    phrase1[0],  // adj1 from first phrase
                    phrase2[1],  // adj2 from second phrase
                    phrase3[2]   // noun from third phrase
                );

                insults.push(Insult {
                    id,
                    insult: insult_text,
                });
                id += 1;
            }
        }
    }

    let payload = json!({
        "insults": insults
    });

    let json_string = serde_json::to_string_pretty(&payload)?;
    file.write_all(json_string.as_bytes())?;

    Ok(())
}
