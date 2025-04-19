#!/bin/bash
# Bump version according to semantic versioning (major, minor, patch)
# Usage: ./bump_version.sh [major|minor|patch]

TYPE=${1:-patch}  # Default to patch if no argument provided

cd ios || { echo "❌ Failed to navigate to ios directory"; exit 1; }

if [[ "$TYPE" == "major" || "$TYPE" == "minor" || "$TYPE" == "patch" ]]; then
  bundle exec fastlane run increment_version_number bump_type:"$TYPE" || { echo "❌ Version bumping failed"; exit 1; }
  echo "✅ Bumped $TYPE version to $(bundle exec fastlane run get_version_number)"
else
  echo "❌ Invalid version bump type. Use major, minor, or patch."
  exit 1
fi

cd ..