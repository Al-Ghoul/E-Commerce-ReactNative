{
  description = "E-Commerce-RN's environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    nixgl.url = "github:guibou/nixGL";

    std = {
      url = "github:divnix/std";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        devshell.url = "github:numtide/devshell";
      };
    };
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = {std, ...} @ inputs:
    std.growOn {
      inherit inputs;
      cellsFrom = ./nix;
      nixpkgsConfig = {
        allowUnfree = true;
        android_sdk.accept_license = true;
      };
      cellBlocks = with std.blockTypes; [
        (devshells "shells")
      ];
    } {
      devShells = std.harvest inputs.self ["repo" "shells"];
    };
}
