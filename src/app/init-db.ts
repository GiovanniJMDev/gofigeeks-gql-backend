import { users as usersTable } from '#/auth/auth.schema'
import { auth } from '#/shared/auth'
import { drizzleClient } from '#/shared/drizzle-client'

// Enable on db connection set up
// initDatabaseUsers()

async function initDatabaseUsers() {
	const users = await drizzleClient.select().from(usersTable)

	if (users.length === 0) {
		console.log('Creating initial users...')

		await auth.api.createUser({
			body: {
				email: 'admin@example.com',
				password: 'admin',
				name: 'Super Admin',
				role: 'admin',
				data: { biography: 'my bio' },
			},
		})
		await auth.api.createUser({
			body: {
				email: 'midu@example.com',
				password: 'midudev',
				name: 'Miguel Ángel Durán',
				role: 'user',
				data: {
					biography: `🧠 Enseño Programación e Inteligencia Artificial
👨‍💻 Software Engineer y Speaker
⭐ +18 años de experiencia · +3M comunidad
✉️ Contacto: hi@midu.dev`,
				},
			},
		})
		await auth.api.createUser({
			body: {
				email: 'bettatech@example.com',
				password: 'bettatech',
				name: 'Martí',
				role: 'user',
				data: {
					biography: `Te ayudo a programar, pero bien 🔬Ingeniero de Software y mal llamado Youtuber 🎙️Creador de TheCommitShow 🧬 Fundador de Commit Academy`,
				},
			},
		})
		await auth.api.createUser({
			body: {
				email: 'rauch@example.com',
				password: 'rauch',
				name: 'Guillermo Rauch',
				role: 'user',
				data: { biography: `@vercel CEO` },
			},
		})

		console.log('Initial users created successfully!')
	}
}
