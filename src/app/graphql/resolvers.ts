import { GraphQLScalarType } from 'graphql'
import { resolvers as Scalars } from 'graphql-scalars'
import { DataLoaders } from './shared/data-loaders'
import { drizzleClient } from '../../contexts/shared/drizzle-client'
import { users as usersTable } from '../../contexts/auth/auth.schema'
import { posts as postsTable } from '../../contexts/post/post.schema'
import { supabaseClient } from '../../contexts/shared/supabase-client'
import { auth } from '../../contexts/shared/auth'

type AuthContext = {
	headers: Headers
	responseHeaders: Headers
}

async function callAuth<T>(
	responseHeaders: Headers,
	call: () => Promise<Response>,
): Promise<T> {
	const response = await call()

	for (const cookie of response.headers.getSetCookie()) {
		responseHeaders.append('set-cookie', cookie)
	}

	const body = await response.json()

	if (!response.ok) {
		throw new Error(body?.message ?? 'Authentication request failed')
	}

	return body as T
}

const Upload = new GraphQLScalarType({
	name: 'Upload',
	description: 'A file sent via a multipart/form-data request',
	parseValue: (value) => value as File,
	serialize: () => {
		throw new Error('Upload scalar cannot be serialized in a response')
	},
})

async function uploadToSupabase(
	fileName: string,
	contentType: string,
	body: Blob,
) {
	const path = `${crypto.randomUUID()}-${fileName}`
	const { error } = await supabaseClient.storage
		.from(process.env.SUPABASE_BUCKET!)
		.upload(path, body, { contentType })

	if (error) throw error

	return supabaseClient.storage
		.from(process.env.SUPABASE_BUCKET!)
		.getPublicUrl(path).data.publicUrl
}

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World2!',
		users: async () => {
			return await drizzleClient.select().from(usersTable)
		},
		posts: async () => {
			return await drizzleClient.select().from(postsTable)
		},
	},
	Mutation: {
		CreateUser: async (
			_parent: unknown,
			args: {
				input: {
					name: string
					email: string
					password: string
					image?: File
					imageUrl?: string
					biography?: string
				}
			},
			context: AuthContext,
		) => {
			const { name, email, password, image, imageUrl, biography } = args.input

			let uploadedImageUrl: string | undefined

			if (image) {
				uploadedImageUrl = await uploadToSupabase(image.name, image.type, image)
			} else if (imageUrl) {
				const response = await fetch(imageUrl)
				if (!response.ok) {
					throw new Error(`Failed to download image from ${imageUrl}`)
				}

				const contentType =
					response.headers.get('content-type') ?? 'application/octet-stream'
				const fileName = imageUrl.split('/').pop() || 'image'
				const blob = await response.blob()

				uploadedImageUrl = await uploadToSupabase(fileName, contentType, blob)
			}

			const { user } = await callAuth<{ user: unknown }>(
				context.responseHeaders,
				() =>
					auth.api.signUpEmail({
						body: {
							name,
							email,
							password,
							image: uploadedImageUrl,
							biography,
						},
						asResponse: true,
					}),
			)

			return user
		},
		CreatePost: async (
			_parent: unknown,
			args: {
				input: {
					title: string
					description: string
					contentUrl: string
					authorId: string
				}
			},
		) => {
			const { title, description, contentUrl, authorId } = args.input

			const [newPost] = await drizzleClient
				.insert(postsTable)
				.values({
					id: crypto.randomUUID(),
					title,
					description,
					contentUrl,
					authorId,
				})
				.returning()
			return newPost
		},
		SignIn: async (
			_parent: unknown,
			args: { email: string; password: string },
			context: AuthContext,
		) => {
			const { user } = await callAuth<{ user: unknown }>(
				context.responseHeaders,
				() =>
					auth.api.signInEmail({
						body: { email: args.email, password: args.password },
						asResponse: true,
					}),
			)

			return { user }
		},
		SignOut: async (
			_parent: unknown,
			_args: unknown,
			context: AuthContext,
		) => {
			await callAuth(context.responseHeaders, () =>
				auth.api.signOut({
					headers: context.headers,
					asResponse: true,
				}),
			)

			return true
		},
	},
	Upload,
	...Scalars,
})
