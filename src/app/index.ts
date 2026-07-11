import './env'

import { renderApolloSandbox } from '@graphql-yoga/render-apollo-sandbox'
import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { schema } from './graphql/schema'
import { DataLoaders } from './graphql/shared/data-loaders'

const cookiesByRequest = new WeakMap<Request, Headers>()

const yoga = createYoga({
	schema,
	context(ctx) {
		const loaders = DataLoaders.createContext()
		const responseHeaders = new Headers()

		cookiesByRequest.set(ctx.request, responseHeaders)

		return {
			...loaders,
			headers: ctx.request.headers,
			responseHeaders,
		}
	},
	plugins: [
		{
			onResponse({ request, response }) {
				const responseHeaders = cookiesByRequest.get(request)
				if (!responseHeaders) return

				for (const cookie of responseHeaders.getSetCookie()) {
					response.headers.append('set-cookie', cookie)
				}
			},
		},
	],
	renderGraphiQL: renderApolloSandbox({
		initialState: {
			includeCookies: true,
		},
	}),
})

const server = createServer(yoga)

server.listen(4000, () => {
	console.info('Server is running on http://localhost:4000/graphql')
})
