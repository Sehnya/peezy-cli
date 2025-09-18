class Peezy < Formula
  desc "Cross-runtime CLI for scaffolding modern applications with deterministic builds"
  homepage "https://github.com/Sehnya/peezy-cli"
  version "1.0.0-alpha.1"
  
  if OS.mac? && Hardware::CPU.arm?
    url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-macos-arm64.tar.gz"
    sha256 "abc123"
  elsif OS.mac? && Hardware::CPU.intel?
    url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-macos-x64.tar.gz"
    sha256 "def456"
  elsif OS.linux? && Hardware::CPU.arm?
    url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-linux-arm64.tar.gz"
    sha256 "CHECKSUM_NOT_FOUND"
  elsif OS.linux? && Hardware::CPU.intel?
    url "https://github.com/Sehnya/peezy-cli/releases/download/v#{version}/peezy-linux-x64.tar.gz"
    sha256 "CHECKSUM_NOT_FOUND"
  end

  def install
    if OS.mac? && Hardware::CPU.arm?
      bin.install "peezy-macos-arm64" => "peezy"
    elsif OS.mac? && Hardware::CPU.intel?
      bin.install "peezy-macos-x64" => "peezy"
    elsif OS.linux? && Hardware::CPU.arm?
      bin.install "peezy-linux-arm64" => "peezy"
    elsif OS.linux? && Hardware::CPU.intel?
      bin.install "peezy-linux-x64" => "peezy"
    end
  end

  test do
    system "#{bin}/peezy", "--version"
    system "#{bin}/peezy", "--help"
  end
end