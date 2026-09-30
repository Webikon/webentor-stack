<?php

use Valet\Drivers\Specific\BedrockValetDriver;

class LocalValetDriver extends BedrockValetDriver
{
    private string $REMOTE_HOST;
    private string $URI_PREFIX;
    private bool $tryRemoteFallback = false;

    public function __construct()
    {
        // Herd loads this outside WordPress, so it reads .env itself. Empty = no remote fallback.
        $this->REMOTE_HOST = $this->envValue(__DIR__ . '/.env', 'UPLOADS_FALLBACK_URL');
        $this->URI_PREFIX = '/app/uploads/';
    }

    public function isStaticFile(string $sitePath, string $siteName, string $uri): bool|string
    {
        $localFileFound = parent::isStaticFile($sitePath, $siteName, $uri);

        if ($localFileFound) {
            return $localFileFound;
        }

        if ($this->REMOTE_HOST !== '' && str_starts_with($uri, $this->URI_PREFIX)) {
            $this->tryRemoteFallback = true;

            return rtrim($this->REMOTE_HOST, '/') . $uri;
        }

        return false;
    }

    public function serveStaticFile(string $staticFilePath, string $sitePath, string $siteName, string $uri): void
    {
        if ($this->tryRemoteFallback) {
            header("Location: $staticFilePath");

            return;
        }

        parent::serveStaticFile($staticFilePath, $sitePath, $siteName, $uri);
    }

    private function envValue(string $file, string $key): string
    {
        $lines = is_readable($file) ? file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];

        foreach ($lines as $line) {
            if (str_starts_with($line, $key . '=')) {
                return trim(substr($line, strlen($key) + 1), " \t\"'");
            }
        }

        return '';
    }
}
