// test-setup.ts
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {
  // Test environment has already been initialized
}

/**
 * Sets up the environment for Playwright e2e tests
 * This ensures that all required providers are available in the e2e environment
 */
export function setUpPlaywrightTestingEnv(): void {
  // This function is intentionally empty as the provider
  // is now registered in app.config.ts, but we keep it
  // for potential future setup needs specific to Playwright
}
