#!/bin/bash

echo "Setting up Prisma..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL before running this script"
  exit 1
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

echo "Prisma setup complete!"
