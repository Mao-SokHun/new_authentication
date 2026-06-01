# constants/

```
constants/
  index.js
  config/       env (VITE_USE_MOCK, API URL)
  ui/           tokens, typography
  filters/      teacherFilters, majorSubjects, languages…
  mock/         mockData, communities, communityFeed…
  legal/        terms, privacy, help content
  backgrounds/  mesh & polygon presets
```

Import from barrel: `import { FILTER_ALL, teachers, isApiEnabled } from '@/constants'`

Or direct: `import { isApiEnabled } from '@/constants/config/env'`
