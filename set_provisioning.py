import pbxproj
import os

# Make sure you have pbxproj installed:
# pip install pbxproj

# Set your specific values as extracted from your mobileprovision file:
project_root = "ios/ontime.xcodeproj"  
project_path = os.path.join(project_root, "project.pbxproj")

# From your screenshots and extracted data:
target_name = "ontime"                        # Your app name
bundle_identifier = "dxqt.real.scammer"       # As seen under the application-identifier in the provisioning file
provisioning_profile_name = "kismat kc"        # The Name field in your mobileprovision file

# The provisioning profile UUID is found from your terminal output using:
# security cms -D -i profile.mobileprovision | grep -A1 UUID | grep string | sed -e 's/<string>//' -e 's/<\/string>//'
provisioning_profile_uuid = "a1115ec3-2d24-47e5-a47e-9a97775f4fb0"

# The team identifier is from the TeamIdentifier array, and the TeamName is shown as well.
development_team = "SGU462SB7N"              

try:
    # Load the Xcode project file
    project = pbxproj.PBXProject.load(project_path)
    found_target = False

    # Iterate over all native targets to find the one matching your app
    for target in project.objects.get_objects_of_type('PBXNativeTarget'):
        if target.name == target_name:
            found_target = True
            # Go through the project's configuration lists and update the build settings for each configuration
            for build_configuration_list in project.objects.get_objects_of_type('XCConfigurationList'):
                if build_configuration_list.isa == 'XCConfigurationList' and build_configuration_list.buildConfigurations:
                    for build_configuration in build_configuration_list.buildConfigurations:
                        build_settings = build_configuration.buildSettings
                        # Set manual code signing and update the related settings:
                        build_settings['CODE_SIGNING_STYLE'] = 'Manual'
                        build_settings['PROVISIONING_PROFILE'] = provisioning_profile_uuid
                        build_settings['PROVISIONING_PROFILE_SPECIFIER'] = provisioning_profile_name
                        build_settings['DEVELOPMENT_TEAM'] = development_team
                        build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = bundle_identifier
            break

    if found_target:
        # Save the modifications back to the project file
        project.save()
        print(f"Successfully set provisioning profile for target '{target_name}'")
    else:
        print(f"Target '{target_name}' not found in the project.")

except FileNotFoundError:
    print(f"Error: Project file not found at '{project_path}'")
except Exception as e:
    print(f"An error occurred: {e}")
