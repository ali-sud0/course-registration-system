# Unit Tests Documentation

## Overview
This directory contains comprehensive unit tests for the Course Registration System backend. Tests are automatically executed when the server starts.

## Test Files

### 1. **test_models.py**
Tests for database models and ORM functionality:
- **TestCourseModel**: Course creation, uniqueness constraints, retrieval
- **TestUserModel**: User creation with different roles (Student, Professor, Admin), suspension functionality
- **TestEnrollmentModel**: Enrollment creation and status transitions
- **TestSemesterModel**: Semester management and retrieval
- **TestScheduleSlotModel**: Schedule slot creation
- **TestCourseOfferingModel**: Course offering with capacity management

### 2. **test_api.py**
Tests for API endpoints and HTTP responses:
- **TestAuthEndpoints**: User registration and login functionality
- **TestCourseEndpoints**: Course CRUD operations
- **TestHealthCheck**: API availability checks
- **TestErrorHandling**: Invalid requests and error responses

### 3. **test_integration.py**
Integration tests for complete workflows:
- **TestEnrollmentWorkflow**: End-to-end student enrollment process
- **TestCourseOfferingManagement**: Multiple course offerings and capacity management
- **TestSemesterManagement**: Semester organization and queries
- **TestUserRoles**: Role-based user creation and permissions

### 4. **test_runner.py**
Test execution manager:
- `run_tests()`: Executes all tests with verbose output
- `run_tests_silent()`: Executes tests without console output
- Called automatically on server startup

## Running Tests

### Automatic (on server startup)
Tests run automatically when the server starts:
```bash
uvicorn app.main:app --reload
```

### Manual Execution
Run all tests:
```bash
pytest app/tests/ -v
```

Run specific test file:
```bash
pytest app/tests/test_models.py -v
```

Run specific test class:
```bash
pytest app/tests/test_models.py::TestCourseModel -v
```

Run specific test:
```bash
pytest app/tests/test_models.py::TestCourseModel::test_create_course -v
```

### With Coverage Report
```bash
pytest app/tests/ --cov=app --cov-report=html -v
```

## Test Database
All tests use an in-memory SQLite database (`sqlite:///:memory:`) configured in `conftest.py`. This ensures:
- Tests run fast
- Tests are isolated
- No data persistence between test runs
- Tests don't affect production/development databases

## Fixtures

### db_session (from conftest.py)
Provides a clean database session for each test:
```python
def test_example(db_session):
    user = User(...)
    db_session.add(user)
    db_session.commit()
```

## Test Coverage

| Module | Classes | Methods | Coverage |
|--------|---------|---------|----------|
| models.course | 1 | 4 | ✓ |
| models.user | 1 | 5 | ✓ |
| models.enrollment | 1 | 2 | ✓ |
| models.semester | 1 | 2 | ✓ |
| models.schedule_slot | 1 | 1 | ✓ |
| models.course_offering | 1 | 2 | ✓ |
| API endpoints | 4 | 6 | ✓ |
| Workflows | 3 | 6 | ✓ |

## Dependencies

Tests require pytest and fastapi TestClient:
```bash
pip install pytest fastapi sqlalchemy
```

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    pip install -r requirements.txt
    pytest app/tests/ -v --tb=short
```

## Troubleshooting

### Tests fail due to import errors
```bash
# Ensure backend directory is in Python path
export PYTHONPATH="${PYTHONPATH}:/path/to/backend"
```

### Database lock errors
- Tests use in-memory SQLite with `check_same_thread=False`
- Restart the test runner if you see database lock errors

### Fixture issues
- Ensure `conftest.py` is in the tests directory
- Fixtures are function-scoped (reset between tests)

## Best Practices

1. **Test Organization**: Group related tests in classes
2. **Test Naming**: Use descriptive names following `test_<action>` convention
3. **Assertions**: One logical assertion per test when possible
4. **Setup/Teardown**: Use fixtures instead of setUp/tearDown methods
5. **Test Independence**: No test should depend on another test's output
6. **Database Cleanup**: Fixtures automatically rollback after each test

## Adding New Tests

1. Create test in appropriate file (models/api/integration)
2. Use db_session fixture for database access
3. Follow naming convention: `test_<what_you_are_testing>`
4. Add docstring describing the test
5. Run tests locally before committing:
   ```bash
   pytest app/tests/ -v
   ```

## Server Startup Output

When server starts, you'll see:
```
======================================================================
SERVER STARTUP - Running Unit Tests
======================================================================

======================================================================
RUNNING UNIT TESTS
======================================================================

tests/test_models.py::TestCourseModel::test_create_course PASSED
tests/test_models.py::TestCourseModel::test_course_code_unique PASSED
...

======================================================================
✓ ALL TESTS PASSED
======================================================================
```

If tests fail:
```
======================================================================
✗ SOME TESTS FAILED
======================================================================

⚠️  WARNING: Some tests failed, but server is continuing...
```

## Performance

- Full test suite execution: ~5-10 seconds
- Individual test: ~0.1 seconds
- Tests don't block server startup (warnings are logged but server continues)

## Related Documentation
- [Main README](../../README.md)
- [Backend Architecture](../../README.md)
- [API Documentation](../POSTMAN_TESTING.md)
