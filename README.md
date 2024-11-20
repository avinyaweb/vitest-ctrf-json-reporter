# 📝 VITEST-CTRF-JSON-REPORTER

> Save Vitest test results as a JSON file

A Vitest test reporter to create test reports that follow the CTRF standard.

It will generate a JSON file `report.json` in the `vitest-ctrf` folder (it is configurable). To show the report, you can use the [ctrf](https://github.com/ctrf-io/github-test-reporter) action.

## 🚀 Quick Start

## 💿 Installation

```shell
pnpm i -D vitest-ctrf-json-reporter
```

## 🔧 Configuration

Add new custom reporter `vite.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['vitest-ctrf-json-reporter'],
  },
})
```

## Requirements

- [vitest](https://vitest.dev/)
- [ctrf](https://github.com/ctrf-io/github-test-reporter)

author: [Ganesh](https://github.com/ganesh-swami)