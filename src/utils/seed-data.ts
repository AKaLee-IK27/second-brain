import type { NoteRecord } from '../core/note/note';

const SEED_NOTES: Omit<NoteRecord, 'createdAt' | 'updatedAt'>[] = [
  // Projects
  { id: 'seed-1', title: 'Website Redesign', content: '<h1>Website Redesign</h1><p>Complete overhaul of the company website.</p><h2>Goals</h2><ul><li>Improve performance</li><li>Modern UI</li></ul><p>See also: [[Design System]] and [[Brand Guidelines]]</p>', paraCategory: 'projects', tags: ['web', 'design'], isDeleted: false },
  { id: 'seed-2', title: 'Mobile App Launch', content: '<h1>Mobile App Launch</h1><p>Planning the Q2 mobile app release.</p><h2>Milestones</h2><ol><li>Design complete</li><li>Development</li><li>Testing</li><li>Launch</li></ol><p>Related: [[API Documentation]]</p>', paraCategory: 'projects', tags: ['mobile', 'launch'], isDeleted: false },
  { id: 'seed-3', title: 'Design System', content: '<h1>Design System</h1><p>Component library and design tokens.</p><h2>Components</h2><p>Buttons, inputs, cards, modals.</p><p>Used in: [[Website Redesign]]</p>', paraCategory: 'projects', tags: ['design', 'components'], isDeleted: false },
  { id: 'seed-4', title: 'Database Migration', content: '<h1>Database Migration</h1><p>Migrate from PostgreSQL to distributed database.</p><h2>Timeline</h2><p>Phase 1: Schema design<br>Phase 2: Data migration<br>Phase 3: Cutover</p>', paraCategory: 'projects', tags: ['database', 'infrastructure'], isDeleted: false },
  { id: 'seed-5', title: 'Marketing Campaign', content: '<h1>Marketing Campaign</h1><p>Q3 digital marketing push.</p><p>See: [[Brand Guidelines]]</p>', paraCategory: 'projects', tags: ['marketing'], isDeleted: false },

  // Areas
  { id: 'seed-6', title: 'Team Management', content: '<h1>Team Management</h1><p>Ongoing team leadership responsibilities.</p><h2>Weekly Tasks</h2><ul><li>1-on-1s</li><li>Sprint planning</li><li>Code reviews</li></ul>', paraCategory: 'areas', tags: ['management', 'leadership'], isDeleted: false },
  { id: 'seed-7', title: 'Personal Finance', content: '<h1>Personal Finance</h1><p>Budget tracking and investment planning.</p><h2>Monthly Review</h2><p>Track expenses, review investments, adjust budget.</p>', paraCategory: 'areas', tags: ['finance', 'personal'], isDeleted: false },
  { id: 'seed-8', title: 'Health & Fitness', content: '<h1>Health & Fitness</h1><p>Exercise routine and nutrition tracking.</p><h2>Weekly Schedule</h2><p>Mon/Wed/Fri: Strength<br>Tue/Thu: Cardio<br>Sat: Yoga</p>', paraCategory: 'areas', tags: ['health', 'fitness'], isDeleted: false },
  { id: 'seed-9', title: 'Home Maintenance', content: '<h1>Home Maintenance</h1><p>Regular upkeep and improvement projects.</p><h2>Seasonal Tasks</h2><ul><li>Spring: Garden prep</li><li>Summer: AC maintenance</li><li>Fall: Gutter cleaning</li><li>Winter: Pipe insulation</li></ul>', paraCategory: 'areas', tags: ['home'], isDeleted: false },

  // Resources
  { id: 'seed-10', title: 'API Documentation', content: '<h1>API Documentation</h1><p>Reference for all internal APIs.</p><h2>Endpoints</h2><h3>Users</h3><p>GET /users, POST /users</p><h3>Notes</h3><p>GET /notes, POST /notes, PUT /notes/:id</p>', paraCategory: 'resources', tags: ['api', 'docs'], isDeleted: false },
  { id: 'seed-11', title: 'Brand Guidelines', content: '<h1>Brand Guidelines</h1><p>Visual identity standards.</p><h2>Colors</h2><p>Primary: #FFE951, Secondary: #51C4F5</p><h2>Typography</h2><p>Headings: Space Grotesk, Body: Literata</p>', paraCategory: 'resources', tags: ['brand', 'design'], isDeleted: false },
  { id: 'seed-12', title: 'React Patterns', content: '<h1>React Patterns</h1><p>Common patterns and best practices.</p><h2>State Management</h2><p>Use Zustand for global state, local state for component-specific data.</p><h2>Performance</h2><p>Use useMemo and useCallback for expensive computations.</p>', paraCategory: 'resources', tags: ['react', 'patterns'], isDeleted: false },
  { id: 'seed-13', title: 'TypeScript Tips', content: '<h1>TypeScript Tips</h1><p>Useful TypeScript patterns and tricks.</p><h2>Generics</h2><p>Use generics for reusable type-safe functions.</p><h2>Utility Types</h2><p>Partial, Pick, Omit, Record are your friends.</p>', paraCategory: 'resources', tags: ['typescript', 'tips'], isDeleted: false },
  { id: 'seed-14', title: 'CSS Grid Cheatsheet', content: '<h1>CSS Grid Cheatsheet</h1><p>Quick reference for CSS Grid layout.</p><h2>Basic Grid</h2><p><code>display: grid; grid-template-columns: repeat(3, 1fr);</code></p>', paraCategory: 'resources', tags: ['css', 'reference'], isDeleted: false },
  { id: 'seed-15', title: 'Meeting Notes Template', content: '<h1>Meeting Notes Template</h1><p>Standard format for meeting notes.</p><h2>Structure</h2><ul><li>Date &amp; Attendees</li><li>Agenda</li><li>Decisions</li><li>Action Items</li></ul>', paraCategory: 'resources', tags: ['template', 'meetings'], isDeleted: false },

  // Archives
  { id: 'seed-16', title: 'Old Project Alpha', content: '<h1>Old Project Alpha</h1><p>Completed project from 2024.</p><h2>Outcome</h2><p>Successfully delivered on time. Lessons learned documented.</p>', paraCategory: 'archives', tags: ['completed'], isDeleted: false },
  { id: 'seed-17', title: 'Deprecated API v1', content: '<h1>Deprecated API v1</h1><p>Old API documentation kept for reference.</p><h2>Migration</h2><p>See [[API Documentation]] for v2.</p>', paraCategory: 'archives', tags: ['api', 'deprecated'], isDeleted: false },
  { id: 'seed-18', title: '2024 Goals Review', content: '<h1>2024 Goals Review</h1><p>Annual review of personal and professional goals.</p><h2>Results</h2><p>8/10 goals achieved. 2 carried over to 2025.</p>', paraCategory: 'archives', tags: ['review', 'goals'], isDeleted: false },
  { id: 'seed-19', title: 'Conference Notes 2024', content: '<h1>Conference Notes 2024</h1><p>Key takeaways from tech conferences.</p><h2>React Conf</h2><p>Server components are the future.</p><h2>TypeScript Summit</h2><p>Decorators are stable now.</p>', paraCategory: 'archives', tags: ['conference', 'learning'], isDeleted: false },
  { id: 'seed-20', title: 'Legacy Code Patterns', content: '<h1>Legacy Code Patterns</h1><p>Common patterns found in the old codebase.</p><h2>Anti-patterns</h2><ul><li>God objects</li><li>Deep inheritance</li><li>Global state</li></ul>', paraCategory: 'archives', tags: ['code', 'legacy'], isDeleted: false },
];

export async function seedIfEmpty(): Promise<boolean> {
  const { db } = await import('../storage/db');

  const count = await db.notes.count();
  if (count > 0) return false;

  // Check if already seeded (prevent race condition with StrictMode)
  const existing = await db.notes.get('seed-1');
  if (existing) return false;

  console.log('🧠 Seeding AKL\'s Knowledge with sample data...');

  const now = Date.now();
  for (let i = 0; i < SEED_NOTES.length; i++) {
    const note: NoteRecord = {
      ...SEED_NOTES[i],
      createdAt: now - (SEED_NOTES.length - i) * 86400000,
      updatedAt: now - (SEED_NOTES.length - i) * 3600000,
    };
    await db.notes.add(note);
  }

  console.log(`✅ Seeded ${SEED_NOTES.length} notes`);
  return true;
}
