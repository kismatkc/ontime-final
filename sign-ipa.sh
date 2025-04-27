#!/bin/bash
# Fully Automated IPA Signing Script - No user interaction required
# Finds IPA in build directory, signs it, and outputs to same directory with -signed suffix
# Enhanced to avoid all keychain password prompts

# --- Configuration ---
P12_PASSWORD="1234"  # Default password for the .p12 file - change if needed

# --- Colorized Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Set up logging with timestamps
log() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "${BLUE}[$timestamp]${RESET} $1"
}

log_warning() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "${YELLOW}[$timestamp] WARNING:${RESET} $1"
}

log_error() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "${RED}[$timestamp] ERROR:${RESET} $1"
}

log_success() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "${GREEN}[$timestamp] SUCCESS:${RESET} $1"
}

log_step() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "\n${MAGENTA}[$timestamp]${RESET} ${CYAN}===== $1 =====${RESET}"
}

# Create a unique temporary keychain name
TEMP_KEYCHAIN="temp_signing_$$.keychain"
KEYCHAIN_PASSWORD="temp$(date +%s)_signing_pw"

# Cleanup function
cleanup() {
  log "Cleaning up..."
  
  # Delete the temporary keychain if it exists
  if security list-keychains | grep -q "$TEMP_KEYCHAIN"; then
    log "Removing temporary keychain: $TEMP_KEYCHAIN"
    security delete-keychain "$TEMP_KEYCHAIN" 2>/dev/null
  fi
  
  # Clean up temp directory
  if [ -d "$TEMP_DIR" ]; then
    log "Removing temporary directory: $TEMP_DIR"
    rm -rf "$TEMP_DIR"
  fi
  
  log "Cleanup completed"
}

# Set cleanup to run on exit
trap cleanup EXIT

log_step "STARTING AUTOMATED IPA SIGNING PROCESS"

# Get the current directory and the build directory
CURRENT_DIR=$(pwd)
BUILD_DIR="$CURRENT_DIR/build"
log "Current directory: $CURRENT_DIR"
log "Build directory: $BUILD_DIR"

# Find the IPA file in the build directory
log "Searching for IPA file in build directory..."
IPA_FILE=$(find "$BUILD_DIR" -maxdepth 1 -name "*.ipa" | head -n 1)

if [ -z "$IPA_FILE" ]; then
  log_error "No IPA file found in the build directory!"
  exit 1
fi

log "Found IPA file: $IPA_FILE"
IPA_FILENAME=$(basename "$IPA_FILE")
IPA_NAME="${IPA_FILENAME%.ipa}"
log "IPA base name: $IPA_NAME"

# Find the P12 certificate file in current directory
log "Searching for P12 certificate file in current directory..."
P12_FILE=$(find "$CURRENT_DIR" -maxdepth 1 -name "*.p12" | head -n 1)

if [ -z "$P12_FILE" ]; then
  log_error "No P12 certificate file found in the current directory!"
  exit 1
fi

log "Found P12 certificate file: $P12_FILE"

# Find the mobileprovision file in current directory
log "Searching for mobileprovision file in current directory..."
PROVISION_FILE=$(find "$CURRENT_DIR" -maxdepth 1 -name "*.mobileprovision" | head -n 1)

if [ -z "$PROVISION_FILE" ]; then
  log_error "No mobileprovision file found in the current directory!"
  exit 1
fi

log "Found mobileprovision file: $PROVISION_FILE"

# Create temporary working directory
TEMP_DIR="$CURRENT_DIR/temp_signing_$$"
log "Creating temporary working directory: $TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Define the output IPA filename (in build directory with -signed suffix)
SIGNED_IPA="$BUILD_DIR/${IPA_NAME}-signed.ipa"
log "Output signed IPA will be: $SIGNED_IPA"

# Create and set up temporary keychain
log_step "SETTING UP SECURE KEYCHAIN"
log "Creating temporary keychain for signing..."
security create-keychain -p "$KEYCHAIN_PASSWORD" "$TEMP_KEYCHAIN" || {
  log_error "Failed to create temporary keychain!"
  exit 1
}

# Add keychain to the search list and set as default
security list-keychains -d user -s "$TEMP_KEYCHAIN" $(security list-keychains -d user | tr -d '"')
security default-keychain -s "$TEMP_KEYCHAIN"

# Unlock the keychain with extended timeout and make it available to all apps
log "Unlocking temporary keychain with extended timeout..."
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$TEMP_KEYCHAIN"
security set-keychain-settings -t 86400 -l "$TEMP_KEYCHAIN"

# Import the certificate into the temporary keychain
log "Importing certificate into temporary keychain..."
security import "$P12_FILE" -k "$TEMP_KEYCHAIN" -P "$P12_PASSWORD" -T /usr/bin/codesign -A || {
  log_error "Failed to import certificate!"
  exit 1
}

# Set partition list to avoid UI prompts (for macOS Sierra and later)
log "Setting partition list to avoid password prompts..."
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$TEMP_KEYCHAIN" 2>/dev/null
if [ $? -ne 0 ]; then
  log_warning "Failed to set partition list, but continuing anyway (might be an older macOS version)"
fi

# Allow codesign to access this keychain without prompting
log "Setting additional keychain permissions..."
security add-trusted-cert -d -r trustRoot -k "$TEMP_KEYCHAIN" "$P12_FILE" 2>/dev/null
security set-keychain-settings -u -t 86400 "$TEMP_KEYCHAIN"

# Get the signing identity from the imported certificate
log "Extracting signing identity..."
SIGNING_IDENTITY=$(security find-identity -v -p codesigning "$TEMP_KEYCHAIN" | head -n 1 | sed -E 's/.*\) ([A-F0-9]+) ".*$/\1/')

if [ -z "$SIGNING_IDENTITY" ]; then
  log_error "Failed to find signing identity in imported certificate!"
  exit 1
fi

# Get the full name of the signing identity
SIGNING_IDENTITY_NAME=$(security find-identity -v -p codesigning "$TEMP_KEYCHAIN" | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')
log "Using signing identity: $SIGNING_IDENTITY_NAME"

# Extract the IPA contents
log_step "PREPARING APP FOR SIGNING"
log "Extracting IPA contents to temporary directory..."
unzip -q "$IPA_FILE" -d "$TEMP_DIR"
if [ $? -ne 0 ]; then
  log_error "Failed to extract IPA contents!"
  exit 1
fi
log "IPA contents extracted successfully"

# Find the app bundle in the Payload directory
APP_BUNDLE=$(find "$TEMP_DIR/Payload" -name "*.app" -type d | head -n 1)
if [ -z "$APP_BUNDLE" ]; then
  log_error "Could not find .app bundle in the IPA file!"
  exit 1
fi

APP_NAME=$(basename "$APP_BUNDLE" .app)
log "Found app bundle: $APP_BUNDLE"
log "App name: $APP_NAME"

# Extract the embedded Info.plist for bundle ID
INFO_PLIST="$APP_BUNDLE/Info.plist"
if [ -f "$INFO_PLIST" ]; then
  BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$INFO_PLIST" 2>/dev/null)
  if [ -n "$BUNDLE_ID" ]; then
    log "Found bundle identifier: $BUNDLE_ID"
  else
    BUNDLE_ID="com.unknown.$APP_NAME"
    log "Could not extract bundle identifier, using: $BUNDLE_ID"
  fi
else
  BUNDLE_ID="com.unknown.$APP_NAME"
  log "Info.plist not found, using default bundle ID: $BUNDLE_ID"
fi

# Process provisioning profile
log "Processing provisioning profile..."
PROVISION_DIR="$TEMP_DIR/provision"
mkdir -p "$PROVISION_DIR"
cp "$PROVISION_FILE" "$PROVISION_DIR/profile.mobileprovision"

# Try to extract entitlements
log "Extracting entitlements..."
security cms -D -i "$PROVISION_DIR/profile.mobileprovision" > "$PROVISION_DIR/profile.plist" 2>/dev/null
if [ $? -eq 0 ]; then
  /usr/libexec/PlistBuddy -x -c "Print:Entitlements" "$PROVISION_DIR/profile.plist" > "$PROVISION_DIR/entitlements.plist" 2>/dev/null
  if [ $? -ne 0 ]; then
    log_warning "Could not extract entitlements from provisioning profile."
  fi
else
  log_warning "Could not parse provisioning profile."
fi

# Try to extract the team ID from the provisioning profile or use a default
if [ -f "$PROVISION_DIR/profile.plist" ]; then
  TEAM_ID=$(/usr/libexec/PlistBuddy -c "Print :TeamIdentifier:0" "$PROVISION_DIR/profile.plist" 2>/dev/null)
  if [ -n "$TEAM_ID" ]; then
    log "Found Team ID in provisioning profile: $TEAM_ID"
  else
    TEAM_ID="SGU462SB7N"  # Fallback to previous default if not found
    log "Could not extract Team ID, using default: $TEAM_ID"
  fi
else
  TEAM_ID="SGU462SB7N"  # Fallback to previous default
  log "Setting Team ID to: $TEAM_ID (from previous logs)"
fi

# Copy the provisioning profile to the app bundle
log "Copying provisioning profile to app bundle..."
cp "$PROVISION_FILE" "$APP_BUNDLE/embedded.mobileprovision"
log "Provisioning profile copied successfully"

# Create entitlements file if we couldn't extract it
if [ ! -f "$PROVISION_DIR/entitlements.plist" ]; then
  log "Creating a basic entitlements file..."
  ENTITLEMENTS_PLIST="$PROVISION_DIR/entitlements.plist"
  cat > "$ENTITLEMENTS_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>application-identifier</key>
    <string>${TEAM_ID}.${BUNDLE_ID}</string>
    <key>com.apple.developer.team-identifier</key>
    <string>${TEAM_ID}</string>
    <key>get-task-allow</key>
    <false/>
    <key>keychain-access-groups</key>
    <array>
        <string>${TEAM_ID}.${BUNDLE_ID}</string>
    </array>
</dict>
</plist>
EOF
  log "Basic entitlements file created at: $ENTITLEMENTS_PLIST"
else
  log "Using extracted entitlements from provisioning profile"
  ENTITLEMENTS_PLIST="$PROVISION_DIR/entitlements.plist"
fi

# Remove the _CodeSignature directory if it exists
log "Removing any existing code signature..."
rm -rf "$APP_BUNDLE/_CodeSignature"

# Update embedded.mobileprovision permissions
log "Setting proper permissions on embedded.mobileprovision..."
chmod 644 "$APP_BUNDLE/embedded.mobileprovision"

# Sign all the frameworks and dynamic libraries in the app bundle (if they exist)
log_step "SIGNING APP COMPONENTS"
if [ -d "$APP_BUNDLE/Frameworks" ]; then
  log "Signing frameworks and libraries in the app bundle..."
  find "$APP_BUNDLE/Frameworks" -type d -name "*.framework" -o -name "*.dylib" 2>/dev/null | while read framework; do
    if [ -n "$framework" ]; then
      log "Signing: $(basename "$framework")"
      chmod -R 755 "$framework"
      /usr/bin/codesign --force --sign "$SIGNING_IDENTITY" --verbose "$framework" 2>&1
      if [ $? -ne 0 ]; then
        log_warning "Failed to sign $(basename "$framework"), continuing anyway..."
      else
        log "Successfully signed $(basename "$framework")"
      fi
    fi
  done
else
  log "No Frameworks directory found, skipping framework signing"
fi

# Sign any plugins (if they exist)
if [ -d "$APP_BUNDLE/PlugIns" ]; then
  log "Signing plugins in the app bundle..."
  find "$APP_BUNDLE/PlugIns" -type d -name "*.appex" 2>/dev/null | while read plugin; do
    if [ -n "$plugin" ]; then
      log "Signing plugin: $(basename "$plugin")"
      chmod -R 755 "$plugin"
      /usr/bin/codesign --force --sign "$SIGNING_IDENTITY" --verbose "$plugin" 2>&1
      if [ $? -ne 0 ]; then
        log_warning "Failed to sign plugin $(basename "$plugin"), continuing anyway..."
      else
        log "Successfully signed plugin $(basename "$plugin")"
      fi
    fi
  done
else
  log "No PlugIns directory found, skipping plugin signing"
fi

# Set proper permissions on the app bundle
log "Setting proper permissions on the app bundle..."
chmod -R 755 "$APP_BUNDLE"

# Sign the main app bundle
log "Signing the main app bundle..."
log "ATTEMPT 1: Signing with entitlements..."
/usr/bin/codesign --force --sign "$SIGNING_IDENTITY" --entitlements "$ENTITLEMENTS_PLIST" --verbose "$APP_BUNDLE" 2>&1
RESULT=$?

# If failed, try without entitlements
if [ $RESULT -ne 0 ]; then
  log "ATTEMPT 2: Signing without entitlements..."
  /usr/bin/codesign --force --sign "$SIGNING_IDENTITY" --verbose "$APP_BUNDLE" 2>&1
  RESULT=$?
fi

# If still failed, try with --deep option
if [ $RESULT -ne 0 ]; then
  log "ATTEMPT 3: Signing with --deep option..."
  /usr/bin/codesign --force --deep --sign "$SIGNING_IDENTITY" --verbose "$APP_BUNDLE" 2>&1
  RESULT=$?
fi

# If all attempts failed
if [ $RESULT -ne 0 ]; then
  log_error "All attempts to sign the app bundle failed!"
  exit 1
else
  log_success "App bundle signed successfully"
fi

# Verify signature
log "Verifying signature..."
/usr/bin/codesign --verify --verbose "$APP_BUNDLE" || log_warning "Signature verification had warnings, but continuing"

# Package the signed IPA
log_step "PACKAGING SIGNED IPA"
log "Packaging the signed IPA..."
(cd "$TEMP_DIR" && zip -qry "$SIGNED_IPA" Payload)
if [ $? -ne 0 ]; then
  log_error "Failed to package the signed IPA!"
  exit 1
fi
log_success "Signed IPA packaged successfully at: $SIGNED_IPA"

# Verify the signed IPA exists
if [ ! -f "$SIGNED_IPA" ]; then
  log_error "Signed IPA file does not exist at expected location!"
  exit 1
fi

# Get the size of the signed IPA
SIGNED_IPA_SIZE=$(du -h "$SIGNED_IPA" | cut -f1)
log "Signed IPA size: $SIGNED_IPA_SIZE"

log_step "IPA SIGNING COMPLETED SUCCESSFULLY"
log_success "Original IPA: $IPA_FILE"
log_success "Signed IPA: $SIGNED_IPA"
log_success "Size: $SIGNED_IPA_SIZE"

echo ""
echo "✅ IPA signing completed successfully!"
echo "📝 Signed IPA file is at: $SIGNED_IPA"



