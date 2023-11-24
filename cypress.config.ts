import { defineConfig } from 'cypress'

export default defineConfig({
    viewportHeight: 1080,
    viewportWidth: 1920,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'reporter-config.json',
    },
    e2e: {
        // setupNodeEvents(on, config) {
        //     // implement node event listeners here
        // },
        baseUrl: 'http://localhost:4200',
        specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
        excludeSpecPattern: [
            '**/1-getting-started/*',
            '**/2-advanced-examples/*',
        ],
    },
})
