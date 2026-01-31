"""
Centralized logging configuration for the backend.
"""
import logging
import sys
from datetime import datetime

# Create formatters
detailed_formatter = logging.Formatter(
    fmt='%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

simple_formatter = logging.Formatter(
    fmt='%(levelname)s: %(message)s'
)

# Create console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(detailed_formatter)

# Create file handler for persistent logs
file_handler = logging.FileHandler(
    f'logs/app_{datetime.now().strftime("%Y%m%d")}.log',
    mode='a'
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(detailed_formatter)

def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Avoid adding duplicate handlers
    if not logger.handlers:
        logger.addHandler(console_handler)
        # Uncomment to also log to file:
        # logger.addHandler(file_handler)
    
    return logger

# Pre-configured loggers for common modules
auth_logger = get_logger("auth")
routes_logger = get_logger("routes")
agent_logger = get_logger("agent")
