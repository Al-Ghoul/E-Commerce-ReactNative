{
  inputs,
  cell,
}: let
  inherit (inputs.std) lib std;
  pkgs = inputs.nixpkgs.appendOverlays [inputs.nixgl.overlay];
in
  builtins.mapAttrs (_: lib.dev.mkShell) {
    default = let
      # These specific versions are REQUIRED by react native
      # Please do NOT mess with them unless you know what you're doing.
      buildToolsVersion = "34.0.0";
      androidComposition = inputs.nixpkgs.androidenv.composeAndroidPackages {
        toolsVersion = null;
        platformVersions = ["34"];
        buildToolsVersions = [buildToolsVersion];
        includeNDK = true;
        ndkVersions = ["26.1.10909125"];
        cmakeVersions = ["3.22.1"];
      };
    in {
      name = "E-Commerce-RN DevShell";

      imports = [std.devshellProfiles.default];

      commands = [
        {package = inputs.nixpkgs.nodejs;}

        {
          # Expose platform tools (aka adb & other executables)
          package = androidComposition.platform-tools;
        }

        {package = pkgs.nixgl.nixGLIntel;}

        {
          name = "dev";
          command = "nixGLIntel $android/bin/run-test-emulator && npm run android";
          help = "Starts the emulator and builds & runs the app.";
        }

        {package = inputs.nixpkgs.jdk17;}
      ];

      env = [
        {
          name = "ANDROID_SDK_ROOT";
          value = "${androidComposition.androidsdk}/libexec/android-sdk";
        }
        
        {
          name = "GRADLE_OPTS";
          value = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${androidComposition.androidsdk}/libexec/android-sdk/build-tools/${buildToolsVersion}/aapt2";
        }

        {
          name = "ANDROID_NDK_ROOT";
          value = "${androidComposition.androidsdk}/libexec/android-sdk/ndk-bundle";
        }

        {
          name = "android";
          value = inputs.nixpkgs.androidenv.emulateApp {
            configOptions = {
              "hw.gpu.enabled" = "yes";
            }; # Enable GPU acceleration
            name = "AlGhoul's-Emulator";
            platformVersion = "29";
            abiVersion = "x86";
            systemImageType = "google_apis_playstore";
            # Resolution could be anything you want, keep the others if your Hardware supports KVM (for better performance)
            androidEmulatorFlags = "-skin 480x800 -accel on -gpu host -qemu -enable-kvm";
          };
        }
      ];
    };
  }
