# #!/bin/bash
# # Automated Firebase App Distribution Upload Script
# # - Automatically finds *-signed.ipa in build directory
# # - Uses firebase-ontime.json in current directory for configuration
# # - Supports specifying testers (email addresses)
# # - Supports force overwriting existing builds

# # --- Colorized Output ---
# RED='\033[0;31m'
# GREEN='\033[0;32m'
# YELLOW='\033[0;33m'
# BLUE='\033[0;34m'
# MAGENTA='\033[0;35m'
# CYAN='\033[0;36m'
# RESET='\033[0m'

# # Set up logging with timestamps
# log() {
#   local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
#   echo -e "${BLUE}[$timestamp]${RESET} $1"
# }

# log_warning() {
#   local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
#   echo -e "${YELLOW}[$timestamp] WARNING:${RESET} $1"
# }

# log_error() {
#   local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
#   echo -e "${RED}[$timestamp] ERROR:${RESET} $1"
# }

# log_success() {
#   local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
#   echo -e "${GREEN}[$timestamp] SUCCESS:${RESET} $1"
# }

# log_step() {
#   local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
#   echo -e "\n${MAGENTA}[$timestamp]${RESET} ${CYAN}===== $1 =====${RESET}"
# }

# # Print usage information
# print_usage() {
#   echo -e "\nUsage: $0 [OPTIONS]"
#   echo -e "\nOptions:"
#   echo -e "  --testers EMAIL1,EMAIL2,...    Comma-separated list of tester email addresses"
#   echo -e "  --release-notes \"NOTES\"       Release notes for this build"
#   echo -e "  --force                        Force update even if build already exists"
#   echo -e "  --help                         Display this help message and exit"
#   echo -e "\nExample:"
#   echo -e "  $0 --testers john@example.com,jane@example.com --release-notes \"Bug fixes and improvements\""
#   echo -e "  $0 --force --release-notes \"Updated version\"\n"
# }

# # Parse command line arguments
# TESTERS="kismatkc28@gmail.com"
# RELEASE_NOTES=""
# FORCE_UPDATE=false

# while [[ $# -gt 0 ]]; do
#   case "$1" in
#     --testers)
#       TESTERS="$2"
#       shift 2
#       ;;
#     --release-notes)
#       RELEASE_NOTES="$2"
#       shift 2
#       ;;
#     --force)
#       FORCE_UPDATE=true
#       shift
#       ;;
#     --help)
#       print_usage
#       exit 0
#       ;;
#     *)
#       log_error "Unknown option: $1"
#       print_usage
#       exit 1
#       ;;
#   esac
# done

# # Print script banner
# log_step "FIREBASE APP DISTRIBUTION UPLOAD SCRIPT"
# log "Starting automated Firebase upload process..."

# # Get current directory
# CURRENT_DIR=$(pwd)
# BUILD_DIR="$CURRENT_DIR/build"
# log "Current directory: $CURRENT_DIR"
# log "Build directory: $BUILD_DIR"

# # Check if Firebase CLI is installed
# log_step "CHECKING PREREQUISITES"
# log "Checking for Firebase CLI..."
# if ! command -v firebase &> /dev/null; then
#     log_error "Firebase CLI not found. Please install it with:"
#     log_error "  npm install -g firebase-tools"
#     log_error "  or"
#     log_error "  curl -sL https://firebase.tools | bash"
#     exit 1
# fi
# FIREBASE_VERSION=$(firebase --version)
# log_success "Firebase CLI found (version: $FIREBASE_VERSION)"

# # Check for build directory
# if [ ! -d "$BUILD_DIR" ]; then
#     log_error "Build directory not found at: $BUILD_DIR"
#     log "Creating build directory..."
#     mkdir -p "$BUILD_DIR"
#     if [ $? -ne 0 ]; then
#         log_error "Failed to create build directory"
#         exit 1
#     fi
#     log_success "Build directory created"
# else
#     log_success "Build directory exists"
# fi

# # Check for firebase-ontime.json configuration file
# FIREBASE_CONFIG="$CURRENT_DIR/firebase-ontime.json"
# if [ ! -f "$FIREBASE_CONFIG" ]; then
#     log_error "Firebase configuration file not found at: $FIREBASE_CONFIG"
#     log_error "Please ensure your firebase-ontime.json file exists in the current directory"
#     exit 1
# fi
# log_success "Firebase configuration file found"

# # Check if jq is installed for better JSON parsing
# if command -v jq &> /dev/null; then
#     log_success "jq is installed, using it for JSON parsing"
#     APP_ID=$(jq -r '.app_id' "$FIREBASE_CONFIG" 2>/dev/null)
#     if [ $? -ne 0 ] || [ -z "$APP_ID" ] || [ "$APP_ID" == "null" ]; then
#         log_warning "Failed to extract app_id using jq, falling back to grep"
#         APP_ID=$(grep -o '"app_id"[[:space:]]*:[[:space:]]*"[^"]*"' "$FIREBASE_CONFIG" | cut -d'"' -f4)
#     fi
# else
#     log_warning "jq not installed, using grep for JSON parsing (less reliable)"
#     APP_ID=$(grep -o '"app_id"[[:space:]]*:[[:space:]]*"[^"]*"' "$FIREBASE_CONFIG" | cut -d'"' -f4)
# fi

# if [ -z "$APP_ID" ]; then
#     log_error "Failed to extract app_id from firebase-ontime.json"
#     log_error "Please ensure your firebase-ontime.json contains a valid app_id field"
#     log_error "Example format:"
#     log_error '{
#   "app_id": "1:123456789012:ios:abcdef1234567890",
#   "other_fields": "..."
# }'
#     exit 1
# fi
# log_success "Found app ID: $APP_ID"

# # Find specifically a *-signed.ipa file in the build directory
# log_step "LOCATING IPA FILE"
# log "Searching specifically for signed IPA file in build directory..."
# SIGNED_IPA=$(find "$BUILD_DIR" -maxdepth 2 -name "*signed*.ipa" | head -n 1)

# if [ -z "$SIGNED_IPA" ]; then
#     log_error "No signed IPA file found in the build directory!"
#     log_error "Looking for files matching pattern: *signed*.ipa"
#     ls -la "$BUILD_DIR"
#     exit 1
# fi

# log_success "Found signed IPA file: $SIGNED_IPA"
# IPA_FILENAME=$(basename "$SIGNED_IPA")
# log "IPA filename: $IPA_FILENAME"

# # Set the service account credentials for authentication
# log_step "AUTHENTICATING WITH FIREBASE"
# log "Setting service account credentials from firebase-ontime.json..."
# export GOOGLE_APPLICATION_CREDENTIALS="$FIREBASE_CONFIG"
# log_success "Credentials set from: $FIREBASE_CONFIG"

# # Test Firebase authentication
# log "Testing Firebase authentication..."
# firebase projects:list > /dev/null 2>&1
# if [ $? -ne 0 ]; then
#     log_warning "Firebase authentication may have issues. Proceeding anyway..."
# else
#     log_success "Firebase authentication successful"
# fi

# # Prepare the distribution command
# log_step "PREPARING UPLOAD COMMAND"
# FIREBASE_CMD="firebase appdistribution:distribute \"$SIGNED_IPA\" --app \"$APP_ID\""

# # Add testers only if specified and not empty
# if [ ! -z "$TESTERS" ]; then
#     log "Adding specified testers: $TESTERS"
#     FIREBASE_CMD="$FIREBASE_CMD --testers \"$TESTERS\""
# fi

# # Add release notes only if specified and not empty
# if [ ! -z "$RELEASE_NOTES" ]; then
#     log "Adding release notes"
#     FIREBASE_CMD="$FIREBASE_CMD --release-notes \"$RELEASE_NOTES\""
# fi

# # Add force flag if specified
# if [ "$FORCE_UPDATE" = true ]; then
#     log "Force update enabled - will overwrite existing builds"
#     FIREBASE_CMD="$FIREBASE_CMD --force"
# fi

# log "Final command: $FIREBASE_CMD"

# # Upload the IPA to Firebase App Distribution
# log_step "UPLOADING TO FIREBASE APP DISTRIBUTION"
# log "Uploading $IPA_FILENAME to Firebase App Distribution..."
# log "App ID: $APP_ID"
# if [ ! -z "$TESTERS" ]; then
#     log "Testers: $TESTERS"
# fi
# if [ "$FORCE_UPDATE" = true ]; then
#     log "Force update: Enabled"
# fi
# log "This process may take several minutes depending on your IPA size and internet connection..."

# # Execute the upload command
# echo -e "${CYAN}Running Firebase command...${RESET}"
# eval $FIREBASE_CMD
# UPLOAD_RESULT=$?

# # Check the result of the upload command
# if [ $UPLOAD_RESULT -eq 0 ]; then
#     log_step "UPLOAD COMPLETED SUCCESSFULLY"
#     log_success "App successfully uploaded to Firebase App Distribution."
#     log_success "IPA file: $IPA_FILENAME"
#     log_success "App ID: $APP_ID"
#     if [ ! -z "$TESTERS" ]; then
#         log_success "Testers: $TESTERS"
#     fi
#     echo ""
#     echo "✅ Firebase upload completed successfully!"
#     echo "📱 Your app should now be available in the Firebase console."
# else
#     log_step "UPLOAD FAILED"
#     log_error "Failed to upload app to Firebase App Distribution."
#     log_error "Exit code: $UPLOAD_RESULT"
#     log_error "Try running the command manually for more detailed error messages:"
#     log_error "$FIREBASE_CMD"
#     log_error ""
#     log_error "Common issues to check:"
#     log_error "1. Is your firebase-ontime.json valid and contains proper service account credentials?"
#     log_error "2. Does the app_id in firebase-ontime.json match your Firebase project?"
#     log_error "3. Is the IPA file properly signed and valid?"
#     log_error "4. Do you have the necessary permissions in Firebase?"
#     echo ""
#     echo "❌ Firebase upload failed!"
#     exit 1
# fi


#!/bin/bash
# Simplified Diawi IPA Upload Script with Email Notification
# Hardcoded configuration - EDIT THESE VALUES
DIAWI_TOKEN="g3aoenx4q4mtzaHmmZ1BSWzYttG6Za5k9jvhoOVJ1Q"  # Replace with your Diawi API token
BUILD_DIR="./build"                  # Hardcoded build directory
MAX_RETRIES=30                       # 30 attempts * 10s = 5 minute timeout
RETRY_DELAY=10                       # Seconds between status checks
EMAIL="kismatkc28@gmail.com"         # Email for notifications

# Find first IPA in build directory
IPA_FILE=$(find "$BUILD_DIR" -maxdepth 1 -name "*signed.ipa" -print -quit)

# Check prerequisites
if ! command -v curl &> /dev/null; then
    echo "ERROR: curl not found. Install curl first."
    exit 1
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo "ERROR: Build directory missing: $BUILD_DIR"
    exit 1
fi

if [ -z "$IPA_FILE" ]; then
    echo "ERROR: No IPA files found in $BUILD_DIR"
    exit 1
fi

# Get app information
APP_NAME=$(basename "$IPA_FILE" .ipa)
APP_SIZE=$(du -h "$IPA_FILE" | cut -f1)
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "Unknown branch")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "Unknown commit")

# Upload to Diawi
echo "Uploading ${IPA_FILE##*/} to Diawi..."
response=$(curl -s -S -X POST "https://upload.diawi.com/" \
    -F "token=$DIAWI_TOKEN" \
    -F "file=@\"$IPA_FILE\"" \
    -F "find_by_udid=0" \
    -F "wall_of_apps=0" \
    -F "callback_emails=$EMAIL")

# Basic JSON parsing without jq
job_id=$(echo "$response" | grep -o '"job":"[^"]*"' | cut -d'"' -f4)
# Fix for escaped slashes in download_link
download_link=$(echo "$response" | grep -o '"link":"[^"]*"' | cut -d'"' -f4 | sed 's/\\\//\//g')

# If immediate link found
if [ -n "$download_link" ]; then
    echo "Download link: $download_link"
    send_email "$download_link"
    exit 0
fi

# If job ID found, start polling
if [ -n "$job_id" ]; then
    echo "Processing... (Job ID: $job_id)"
    attempt=1
    while [ $attempt -le $MAX_RETRIES ]; do
        sleep $RETRY_DELAY
        status_response=$(curl -s -S "https://upload.diawi.com/status?token=$DIAWI_TOKEN&job=$job_id")
        
        status=$(echo "$status_response" | grep -o '"status":[0-9]*' | cut -d':' -f2)
        # Fix for escaped slashes in download_link
        download_link=$(echo "$status_response" | grep -o '"link":"[^"]*"' | cut -d'"' -f4 | sed 's/\\\//\//g')
        
        if [ "$status" -eq 2000 ] && [ -n "$download_link" ]; then
            echo "Download link: $download_link"
            send_email "$download_link"
            exit 0
        elif [ "$status" -eq 2001 ]; then
            echo "Still processing... (attempt $attempt/$MAX_RETRIES)"
            ((attempt++))
        else
            echo "Error processing upload: $status_response"
            exit 1
        fi
    done
    echo "Timeout reached. Check Diawi dashboard for job: $job_id"
    exit 1
fi

# If no job ID or link received
echo "Unexpected response from Diawi: $response"
exit 1

# Function to send email notification
send_email() {
    local download_link="$1"
    local subject="New App Build Available on Diawi"
    local message="
App Build Information:
---------------------
App Name: $APP_NAME
Upload Date/Time: $TIMESTAMP
File Size: $APP_SIZE
Git Branch: $GIT_BRANCH
Git Commit: $GIT_COMMIT

Download Link: $download_link

This is an automated message from your Diawi upload script.
"

    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "$subject" "$EMAIL"
        echo "Email notification sent to $EMAIL"
    else
        # Alternative using sendmail if available
        if command -v sendmail &> /dev/null; then
            (
                echo "Subject: $subject"
                echo "To: $EMAIL"
                echo "Content-Type: text/plain"
                echo
                echo "$message"
            ) | sendmail -t
            echo "Email notification sent to $EMAIL using sendmail"
        else
            echo "Warning: Could not send email notification. Mail command not available."
            echo "Would have sent:"
            echo "$message"
        fi
    fi
}