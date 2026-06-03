# Constants (`@/constants`)

Domain-organized app constants (no mock data folder).

```
constants/
  config/       env (API URL)
  ui/           tokens, typography
  filters/      teacher filters, subjects
  teacher/      empty profile defaults, gender options
  communities/  UI tabs/categories; lists filled via API
  legal/        privacy/terms/help copy
  backgrounds/  mesh/polygon presets
```

Import from barrel: `import { FILTER_ALL, isApiEnabled } from '@/constants'`
