import '@/env'

import { auth } from '#/shared/auth'
import { drizzleClient } from '#/shared/drizzle-client'
import { reset } from 'drizzle-seed'
import * as schema from '../src/contexts/auth/auth.schema'
import { users } from './seed/users'

console.log('Resetting database...')

await reset(drizzleClient, schema)

console.log('Seeding initial users...')

await Promise.all(
	users.map((user) =>
		auth.api.createUser({
			body: {
				email: user.email,
				password: user.password,
				name: user.name,
				role: user.role as any,
				data: { biography: user.biography },
			},
		}),
	),
)

console.log('Seed completed successfully!')
process.exit(0)
