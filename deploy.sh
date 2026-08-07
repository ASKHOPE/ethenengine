#!/usr/bin/env bash
# Automated On-Premises & Bare-Metal Deployment Script for Platform

set -e

echo "======================================================="
echo " Starting Platform On-Premises / Cloud Deployment..."
echo "======================================================="

# Check Docker installation
if ! command -v docker &> /dev/null
then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Build and start services in detached mode
echo "[1/3] Building production containers..."
docker compose build

echo "[2/3] Starting containerized services (Node Core + Rust Workers + Postgres + Nginx Gateway)..."
docker compose up -d

echo "[3/3] Verifying deployment health..."
sleep 5
docker compose ps

echo "======================================================="
echo " Deployment Successfully Completed!"
echo " Control Panel: http://localhost/admin"
echo " Health Endpoint: http://localhost/api/core/capabilities"
echo "======================================================="
