import { inArray } from 'drizzle-orm'
import { drizzleClient } from '../../contexts/shared/drizzle-client'
import { users as usersTable } from '../../contexts/auth/auth.schema'
import { posts as postsTable } from '../../contexts/post/post.schema'
export type LoaderKey<Params = any> = {
	obj: any
	params: Params
}

type UserRow = typeof usersTable.$inferSelect
type PostRow = typeof postsTable.$inferSelect

export const loaders = {
	Query: {
		user: async (keys: readonly LoaderKey<{ id: string }>[]) => {
			const ids = keys.map((key) => key.params.id)

			const rows = await drizzleClient
				.select()
				.from(usersTable)
				.where(inArray(usersTable.id, ids))

			const rowsById = new Map<string, UserRow>(
				rows.map((row) => [row.id, row]),
			)

			return ids.map((id) => rowsById.get(id) ?? null)
		},
		post: async (keys: readonly LoaderKey<{ id: string }>[]) => {
			const ids = keys.map((key) => key.params.id)

			const rows = await drizzleClient
				.select()
				.from(postsTable)
				.where(inArray(postsTable.id, ids))

			const rowsById = new Map<string, PostRow>(
				rows.map((row) => [row.id, row]),
			)
			return ids.map((id) => rowsById.get(id) ?? null)
		},
	},
}
