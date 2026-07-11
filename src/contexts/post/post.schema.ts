import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from '../auth/auth.schema'

export const posts = pgTable('posts', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
    description: text('description').notNull(),
    url: text('url').notNull(),
	authorId: text('author_id')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})
