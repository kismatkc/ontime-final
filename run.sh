xcodebuild -workspace ./ios/ontime.xcworkspace \
           -scheme ontime \
           -configuration Release \
           PROVISIONING_PROFILE="a1115ec3-2d24-47e5-a47e-9a97775f4fb0" \
           PROVISIONING_PROFILE_SPECIFIER="kismat kc" \
           CODE_SIGN_IDENTITY="iPhone Distribution: Hoosiers Helping Haiti Inc (SGU462SB7N)" \
           DEVELOPMENT_TEAM="SGU462SB7N"