//! Parsing logic for reading and processing insult phrase files

use crate::error::InsultError;
use regex::Regex;

/// Type alias for a single insult phrase (3 strings: adjective, adjective, noun)
pub type InsultPhrase = [String; 3];

/// Type alias for a collection of insult phrases
pub type PhraseList = Vec<InsultPhrase>;

/// Expected number of fields per line in the phrases file
const EXPECTED_FIELDS_PER_LINE: usize = 3;

/// Parse a single line from a phrases file into an insult phrase.
///
/// Each line should contain exactly 3 tab-separated fields representing
/// two adjectives and one noun for constructing insults in the format:
/// "Thou \[adj1\] \[adj2\] \[noun\]!"
///
/// # Arguments
/// 
/// * `line` - A string slice containing the tab-separated phrase data
/// * `line_number` - The line number for error reporting (1-indexed)
///
/// # Returns
///
/// Returns `Ok(InsultPhrase)` on success, or an [`InsultError`] if:
/// - The regex compilation fails
/// - The line doesn't have exactly 3 fields
/// - Fields contain only whitespace
///
/// # Examples
///
/// ```rust
/// use gin::parser::parse_line;
/// 
/// let phrase = parse_line("artless\tbeef-witted\tcanker-blossom", 1)?;
/// assert_eq!(phrase[0], "artless");
/// assert_eq!(phrase[1], "beef-witted"); 
/// assert_eq!(phrase[2], "canker-blossom");
/// ```
pub fn parse_line(line: &str, line_number: usize) -> Result<InsultPhrase, InsultError> {
    let re = Regex::new(r"\t+")
        .map_err(|e| InsultError::ParseError(e.to_string()))?;
    
    let fields: Vec<String> = re
        .split(line.trim())
        .map(|s| s.trim().to_string())
        .collect();

    if fields.len() != EXPECTED_FIELDS_PER_LINE {
        return Err(InsultError::InvalidFormat(format!(
            "Line {}: Expected {} fields, found {}",
            line_number, EXPECTED_FIELDS_PER_LINE, fields.len()
        )));
    }

    // Convert Vec to fixed-size array
    Ok([
        fields[0].clone(),
        fields[1].clone(), 
        fields[2].clone(),
    ])
}

/// Read and parse insult phrases from a file or embedded data
pub fn read_phrases(path: &str, embedded_data: &str, default_file: &str) -> Result<PhraseList, InsultError> {
    let content = if path == default_file {
        // Use embedded data for default file
        embedded_data.to_string()
    } else {
        // Read from external file for custom paths
        std::fs::read_to_string(path)?
    };
    
    let mut phrases = Vec::new();
    
    for (line_number, line) in content.lines().enumerate() {
        // Skip empty lines
        if line.trim().is_empty() {
            continue;
        }
        
        let phrase = parse_line(line, line_number + 1)?;
        phrases.push(phrase);
    }
    
    if phrases.is_empty() {
        return Err(InsultError::InvalidFormat(
            "No valid phrases found".to_string()
        ));
    }
    
    Ok(phrases)
}
