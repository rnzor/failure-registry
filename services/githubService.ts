interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
}

interface VersionCache {
  version: string;
  timestamp: number;
  expiresAt: number;
}

const CACHE_KEY = 'awesome-tech-failures-version';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class GitHubService {
  private static get owner(): string {
    return (import.meta as any).env?.VITE_GITHUB_OWNER || 'rnzor';
  }

  private static get repo(): string {
    return (import.meta as any).env?.VITE_GITHUB_REPO || 'awesome-tech-failures';
  }

  /**
   * Fetch the latest release from GitHub API
   */
  private static async fetchLatestRelease(): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Awesome-Tech-Failures-App'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: GitHubRelease = await response.json();
      return data.tag_name;
    } catch (error) {
      console.warn('Failed to fetch version from GitHub:', error);
      return null;
    }
  }

  /**
   * Get cached version if still valid
   */
  private static getCachedVersion(): VersionCache | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cache: VersionCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now < cache.expiresAt) {
        return cache;
      }

      // Remove expired cache
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.warn('Failed to read version cache:', error);
      return null;
    }
  }

  /**
   * Cache version with expiration
   */
  private static setCachedVersion(version: string): void {
    try {
      const cache: VersionCache = {
        version,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache version:', error);
    }
  }

  /**
   * Get the latest version, using cache when possible
   */
  static async getLatestVersion(): Promise<string> {
    // Try cache first
    const cached = this.getCachedVersion();
    if (cached) {
      return cached.version;
    }

    // Fetch from GitHub API
    const latestVersion = await this.fetchLatestRelease();
    if (latestVersion) {
      this.setCachedVersion(latestVersion);
      return latestVersion;
    }

    // Fallback to package.json version
    return this.getFallbackVersion();
  }

  /**
   * Get fallback version from package.json
   */
  private static getFallbackVersion(): string {
    // Use the known version from package.json
    return 'v2.0.26_STABLE';
  }
}