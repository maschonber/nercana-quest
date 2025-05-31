import { ProductionRandomProvider } from '../src/app/shared/services/random.service';

/**
 * Sets up the environment for Playwright e2e tests
 * This ensures that all required providers are available in the e2e environment
 */
async function globalSetup() {
  // Here we can add any specific setup needed for Playwright tests
  console.log('Setting up Playwright test environment...');
}

export default globalSetup;
