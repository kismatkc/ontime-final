#!/bin/bash
# Universal Unsigned IPA Builder for any Expo project

# Force yes to all prompts
export EXPO_NON_INTERACTIVE=1
export GIT_TERMINAL_PROMPT=0

# Initialize variables
PROJECT_DIR=$(pwd)
BUILD_DIR="$PROJECT_DIR/build"
LOG_FILE="$BUILD_DIR/build_log.txt"

# Enhanced logging function
log() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  local message="$1"
  echo "[$timestamp] $message"
  echo "[$timestamp] $message" >> "$LOG_FILE"
}

# Create build directory and initialize log file
mkdir -p "$BUILD_DIR"
echo "# Build started at $(date)" > "$LOG_FILE"

# Get project name from package.json
log "Starting build process..."
if [ -f "$PROJECT_DIR/package.json" ]; then
  PROJECT_NAME=$(node -e "console.log(require('./package.json').name)" 2>/dev/null)
  if [ -z "$PROJECT_NAME" ]; then
    log "WARNING: Could not extract name from package.json, using directory name instead"
    PROJECT_NAME=$(basename "$PROJECT_DIR")
  fi
else
  log "WARNING: No package.json found, using directory name as project name"
  PROJECT_NAME=$(basename "$PROJECT_DIR")
fi

log "Detected project: $PROJECT_NAME"

# Initialize build directory
mkdir -p "$BUILD_DIR"
log "Building unsigned IPA for $PROJECT_NAME..."

# Check dependencies
xcode-select -p > /dev/null || { log "ERROR: Xcode tools missing"; exit 1; }
log "Xcode tools detected"

# Load environment variables from .env if exists
if [ -f "$PROJECT_DIR/.env" ]; then
  log "Loading environment variables from .env file"
  set -a
  source "$PROJECT_DIR/.env"
  set +a
  # Export Google API key if present
  if [ ! -z "$EXPO_PUBLIC_GOOGLE_API_KEY" ]; then
    log "EXPO_PUBLIC_GOOGLE_API_KEY loaded"
    export EXPO_PUBLIC_GOOGLE_API_KEY
  fi
fi

# Clean previous builds
log "Cleaning previous build artifacts"
rm -rf "$BUILD_DIR"/*.xcarchive "$BUILD_DIR"/Payload "$BUILD_DIR"/*.ipa

# Handle git status but always continue
log "Checking git status"
if git status &>/dev/null; then
  UNCOMMITTED=$(git status --porcelain | wc -l)
  if [ "$UNCOMMITTED" -gt 0 ]; then
    log "Git branch has uncommited file changes (proceeding anyway)"
  fi
else
  log "Not a git repository or git not installed"
fi

# Generate iOS project files
log "Generating iOS files with Expo prebuild"
npx expo prebuild --clean > "$LOG_FILE" 2>&1 || log "WARNING: iOS project generation reported issues, continuing anyway"
log "iOS project generation completed"

# Detect workspace and scheme
log "Locating Xcode workspace"
WORKSPACE=$(find "$PROJECT_DIR/ios" -name "*.xcworkspace" | head -n 1)
SCHEME=${WORKSPACE##*/}
SCHEME=${SCHEME%.xcworkspace}
log "Using workspace: $WORKSPACE"
log "Using scheme: $SCHEME"

# Archive project
log "Archiving project (this may take several minutes)..."
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$BUILD_DIR/$PROJECT_NAME.xcarchive" \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO >> "$LOG_FILE" 2>&1

if [ ! -d "$BUILD_DIR/$PROJECT_NAME.xcarchive" ]; then
  log "ERROR: Archive failed. See $LOG_FILE for details"
  exit 1
else
  ARCHIVE_SIZE=$(du -sh "$BUILD_DIR/$PROJECT_NAME.xcarchive" | cut -f1)
  log "Archive created successfully (Size: $ARCHIVE_SIZE)"
fi

# Create IPA structure
log "Creating IPA structure"
mkdir -p "$BUILD_DIR/Payload" || { log "ERROR: Failed to create Payload directory"; exit 1; }
APP_FILE=$(find "$BUILD_DIR/$PROJECT_NAME.xcarchive/Products/Applications" -name "*.app" | head -n 1)
log "Using app file: $APP_FILE"
cp -R "$APP_FILE" "$BUILD_DIR/Payload/" || { log "ERROR: Failed to copy app bundle"; exit 1; }

# Package IPA
log "Packaging IPA"
(cd "$BUILD_DIR" && zip -r "$PROJECT_NAME.ipa" Payload) >> "$LOG_FILE" 2>&1 || { log "ERROR: Failed to zip Payload"; exit 1; }

# Validate IPA
if [ -s "$BUILD_DIR/$PROJECT_NAME.ipa" ]; then
  IPA_SIZE=$(du -h "$BUILD_DIR/$PROJECT_NAME.ipa" | cut -f1)
  log "SUCCESS: Unsigned IPA created at $BUILD_DIR/$PROJECT_NAME.ipa (Size: $IPA_SIZE)"
else
  log "ERROR: IPA file is empty or missing"
  exit 1
fi

# Clean up temp files
rm -rf "$BUILD_DIR/Payload"

# Print summary
log "Build completed successfully"
echo ""
echo "✅ Build completed! IPA file is at: $BUILD_DIR/$PROJECT_NAME.ipa"
echo "📋 Complete build log available at: $LOG_FILE"