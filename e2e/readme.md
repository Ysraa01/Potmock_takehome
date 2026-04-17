# Potmock_takehome
## Documentation
## Prerequisites
    - language: typescript
    - framework: Playwright, hard coded data - no fancy framework
        -download Playwright plugin, initialize via "npm init playwright"
    - Docker run:docker pull <registry>/potmock:latest
                docker run -p 3000:3000 <registry>/potmock:latest
    - dependencies : "npm install", "npm test"
## Current runtime versions: 
        Docker: node:20-alpine
        @playwright/test: 1.59.1
        vitest: 2.1.0
        better-sqlite3: 11.3.0
 
 ## Run test suits separatly 
    API test:    npm run test:playwright e2e/APItest/api_happy/api1.contribute.spec.ts
        happy path: npm run test:playwright e2e/APItest/api_happy
        negative path: npm run test:playwright e2e/APItest/api_negative
        business rules: npm run test:playwright "e2e/APItest/api_business rules"
    UI test:  npm run test:playwright e2e/UItest/test-UI-Create\ open\ pot.spec.ts

## Config
webServer: {
  command: 'npm run start',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,}


