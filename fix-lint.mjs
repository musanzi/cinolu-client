// Fix lint errors automatically

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = 'F:\\projets\\Cinolu\\cinolu.org\\src\\app\\features\\dashboard';

// Fix 1: Array<T> → T[]
const fixes = [
  {
    file: join(projectRoot, 'pages/mentor/resources/components/resource-filters/resource-filters.ts'),
    replacements: [
      {
        from: 'readonly categories: Array<{ value: ResourceCategory; label: string }> = [',
        to: 'readonly categories: { value: ResourceCategory; label: string }[] = ['
      }
    ]
  },
  {
    file: join(projectRoot, 'pages/mentor/resources/components/resource-form/resource-form.ts'),
    replacements: [
      {
        from: '  13:28  error  \'CreateResourceDto\' is defined but never used',
        to: '// Remove unused imports'
      },
      {
        from: 'import { ResourceCategory, CreateResourceDto, UpdateResourceDto } from',
        to: 'import { ResourceCategory } from'
      },
      {
        from: 'readonly categories: Array<{ value: ResourceCategory; label: string }> = [',
        to: 'readonly categories: { value: ResourceCategory; label: string }[] = ['
      },
      {
        from: '@Output() cancel = new EventEmitter<void>();',
        to: '@Output() cancelForm = new EventEmitter<void>();'
      }
    ]
  }
];

console.log('Lint fixes script - run manually to apply');
