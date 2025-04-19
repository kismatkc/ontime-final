#!/bin/bash

# --- Configuration ---
# Ensure the script exits immediately if a command fails
set -e
# Ensure the script errors if trying to use an unset variable
set -u
# Use pipeline's exit status, not just the last command's
set -o pipefail

# --- Prerequisite Check ---
echo "Checking for required files..."

# Check for .p12 file (any filename)
# 'compgen -G' is a bash built-in that expands globs; check if the expansion is non-empty
# Using nullglob ensures that if no files match, the pattern expands to nothing, not the pattern itself.
shopt -s nullglob
p12_files=(*.p12)
prov_files=(*.mobileprovision)
shopt -u nullglob # Turn off nullglob after use

# Validate presence of files
errors_found=0
if [ ${#p12_files[@]} -eq 0 ]; then
  echo "Error: No .p12 file found in the current directory." >&2
  errors_found=1
fi

if [ ${#prov_files[@]} -eq 0 ]; then
  echo "Error: No .mobileprovision file found in the current directory." >&2
  errors_found=1
fi

# Exit if any prerequisites are missing
if [ $errors_found -ne 0 ]; then
  echo "Prerequisite files missing. Aborting." >&2
  exit 1
fi

echo "Found required .p12 and .mobileprovision files."
echo "Proceeding with the build, sign, and upload process..."
echo "---"

# --- Execution Pipeline ---

echo "[Step 1/3] Running build-unsigned-ipa.sh..."
./build-unsigned-ipa.sh
echo "build-unsigned-ipa.sh completed."
echo "---"

echo "[Step 2/3] Running sign-ipa.sh..."
./sign-ipa.sh
echo "sign-ipa.sh completed."
echo "---"

echo "[Step 3/3] Running firebase_upload.sh..."
./firebase_upload.sh
echo "firebase_upload.sh completed."
echo "---"

echo "All steps completed successfully!"
exit 0