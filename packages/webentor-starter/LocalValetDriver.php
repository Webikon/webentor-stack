<?php

use Valet\Drivers\Specific\BedrockValetDriver;

class LocalValetDriver extends BedrockValetDriver
{
    private string $REMOTE_HOST;
    private string $URI_PREFIX;
    private bool $tryRemoteFallback = false;

    public function __construct()
    {
        // TODO:Get from .env file?
        $this->REMOTE_HOST = 'https://webentor-starter-project.dev.webikon.sk/';
        $this->URI_PREFIX = '/app/uploads/';
    }

    public function isStaticFile(string $sitePath, string $siteName, string $uri): bool|string
    {
        $localFileFound = parent::isStaticFile($sitePath, $siteName, $uri);

        if ($localFileFound) {
            return $localFileFound;
        }

        if (str_starts_with($uri, $this->URI_PREFIX)) {
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
}
