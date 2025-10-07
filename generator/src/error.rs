//! Error handling for the Shakespearean insult generator.
//!
//! This module provides a comprehensive error type [`InsultError`] that covers
//! all possible failure modes in the application, from I/O errors to parsing
//! failures. All error types implement the standard [`std::error::Error`] trait
//! and provide automatic conversion from common error types via [`From`] implementations.
//!
//! # Examples
//!
//! ```rust
//! use gin::error::InsultError;
//! 
//! // Automatic conversion from std::io::Error
//! let result: Result<(), InsultError> = std::fs::read_to_string("missing.txt")
//!     .map_err(InsultError::from)
//!     .map(|_| ());

/// Comprehensive error type for all failure modes in the insult generator.
#[derive(Debug)]
pub enum InsultError {
    /// I/O operation failed (file not found, permission denied, etc.)
    IoError(std::io::Error),
    
    /// Parsing operation failed (regex compilation, invalid format, etc.)
    ParseError(String),
    
    /// JSON serialization/deserialization failed
    JsonError(serde_json::Error),
    
    /// Input data format is invalid (wrong number of fields, empty file, etc.)
    InvalidFormat(String),
}

impl std::fmt::Display for InsultError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            InsultError::IoError(e) => write!(f, "IO error: {}", e),
            InsultError::ParseError(msg) => write!(f, "Parse error: {}", msg),
            InsultError::JsonError(e) => write!(f, "JSON error: {}", e),
            InsultError::InvalidFormat(msg) => write!(f, "Invalid format: {}", msg),
        }
    }
}

impl std::error::Error for InsultError {}

impl From<std::io::Error> for InsultError {
    fn from(error: std::io::Error) -> Self {
        InsultError::IoError(error)
    }
}

impl From<serde_json::Error> for InsultError {
    fn from(error: serde_json::Error) -> Self {
        InsultError::JsonError(error)
    }
}
