import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { users } from '../auth/auth.schema'

export const posts = pgTable('posts', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	contentUrl: text('content_url').notNull(),
	likes: integer('likes').notNull().default(0),
	authorId: text('author_id')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
