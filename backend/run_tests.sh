#!/bin/bash
# Setup script to install test dependencies and run tests

echo "Installing test dependencies..."
pip3 install pytest pytest-cov pytest-asyncio

echo ""
echo "Running unit tests..."
cd /home/unline/Desktop/CRS-Back-Front/course-registration-system/backend

python3 -m pytest app/tests/ -v --tb=short

echo ""
echo "Test execution complete!"
