class Peezy < Formula
  desc "Production-ready CLI for scaffolding modern applications with curated full-stack templates"
  homepage "https://github.com/Sehnya/peezy-cli"
  version "1.0.3"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-macos-arm64.tar.gz"
      sha256 "REPLACE_WITH_MACOS_ARM64_CHECKSUM"

      def install
        bin.install "peezy-macos-arm64" => "peezy"
      end
    end

    on_intel do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-macos-x64.tar.gz"
      sha256 "REPLACE_WITH_MACOS_X64_CHECKSUM"

      def install
        bin.install "peezy-macos-x64" => "peezy"
      end
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-linux-arm64.tar.gz"
      sha256 "REPLACE_WITH_LINUX_ARM64_CHECKSUM"

      def install
        bin.install "peezy-linux-arm64" => "peezy"
      end
    end

    on_intel do
      url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-linux-x64.tar.gz"
      sha256 "REPLACE_WITH_LINUX_X64_CHECKSUM"

      def install
        bin.install "peezy-linux-x64" => "peezy"
      end
    end
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/peezy --version")
    assert_match "peezy", shell_output("#{bin}/peezy --help")
  end
end
