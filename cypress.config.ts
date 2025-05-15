import { defineConfig } from 'cypress';
import configurePlugin from '@cypress/code-coverage/task';

export default defineConfig({
  projectId: 'gdrive',
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    experimentalStudio: true,
    experimentalWebKitSupport: true,
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      configurePlugin(on, config);
      
      // Add file preprocessor for handling TypeScript
      on('file:preprocessor', require('@cypress/webpack-preprocessor')());
      
      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    codeCoverage: {
      exclude: ['cypress/**/*.*', '**/__tests__/**/*.*'],
    },
  },
});
