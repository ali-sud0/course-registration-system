"""Test runner with progress tracking and colored output."""

import sys
import time
from app.core.db import SessionLocal
from app.tests.test_suite import TESTS, TestResult


def get_terminal_width():
    """Get terminal width for right-aligned text."""
    try:
        return max(80, int(__import__('os').popen('tput cols', 'r').read()) or 80)
    except:
        return 120


class ColorText:
    """ANSI color codes for terminal output."""
    YELLOW = '\033[93m'
    GREEN = '\033[92m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def format_progress_line(test_index, total_tests, test_name, result, terminal_width):
    """Format a test result line with right-aligned percentage."""
    percentage = int((test_index + 1) / total_tests * 100)
    
    # Build the percentage display with yellow color
    percent_str = f"{ColorText.YELLOW}{percentage:3d}%{ColorText.RESET}"
    
    # Status indicator
    status = "✓" if result.passed else "✗"
    status_color = ColorText.GREEN if result.passed else ColorText.RED
    status_display = f"{status_color}{status}{ColorText.RESET}"
    
    # Left side: status and test name
    left = f"  {status_display} {test_name}"
    
    # Right side: percentage
    # Calculate spacing to right-align
    # Account for ANSI codes in left string (each code adds ~10 chars but takes 0 display space)
    display_len = len(left) - (left.count('\033') * 4)  # Approximate ANSI code length
    right = percent_str
    
    # Target: make percentage appear at right edge
    spacing = max(1, terminal_width - display_len - 10)  # 10 for percentage + padding
    
    line = left + " " * spacing + right
    return line, result.error


def run_all_tests():
    """Run all tests and display progress."""
    db = SessionLocal()
    terminal_width = get_terminal_width()
    
    print("\n" + "=" * terminal_width)
    print(f"{ColorText.BOLD}{ColorText.YELLOW}RUNNING COMPREHENSIVE TEST SUITE{ColorText.RESET}")
    print("=" * terminal_width + "\n")
    
    results = []
    total = len(TESTS)
    start_time = time.time()
    
    for index, (test_name, test_func) in enumerate(TESTS):
        try:
            result = TestResult(test_name)
            try:
                test_func(db)
                result.passed = True
            except Exception as e:
                result.error = str(e)
            
            line, error = format_progress_line(index, total, test_name, result, terminal_width)
            print(line)
            
            if error:
                print(f"      {ColorText.RED}Error: {error}{ColorText.RESET}")
            
            results.append(result)
        except Exception as e:
            result = TestResult(test_name)
            result.error = str(e)
            line, _ = format_progress_line(index, total, test_name, result, terminal_width)
            print(line)
            print(f"      {ColorText.RED}Error: {str(e)}{ColorText.RESET}")
            results.append(result)
    
    # Summary
    elapsed = time.time() - start_time
    passed = sum(1 for r in results if r.passed)
    failed = total - passed
    
    print("\n" + "=" * terminal_width)
    print(f"Test Results: {ColorText.GREEN}{passed} passed{ColorText.RESET}, {ColorText.RED}{failed} failed{ColorText.RESET} ({total} total) in {elapsed:.2f}s")
    print("=" * terminal_width + "\n")
    
    db.close()
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
