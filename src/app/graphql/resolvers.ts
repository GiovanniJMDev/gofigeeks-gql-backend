import { resolvers as Scalars } from 'graphql-scalars'
import { DataLoaders } from './shared/data-loaders'
import { drizzleClient } from '../../contexts/shared/drizzle-client'
import { users as usersTable } from '../../contexts/auth/auth.schema'

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World2!',
		users: async () => {
			return await drizzleClient.select().from(usersTable)
		},
	},
	Mutation: {
		CreateUser: async (
			_parent: unknown,
			args: {
				input: {
					name: string
					email: string
					image?: string
					biography?: string
				}
			},
		) => {
			const { name, email, image, biography } = args.input
			const [newUser] = await drizzleClient
				.insert(usersTable)
				.values({ id: crypto.randomUUID(), name, email, image, biography })
				.returning()
			return newUser
		},
	},
	...Scalars,
})
