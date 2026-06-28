import './env'

import { renderApolloSandbox } from '@graphql-yoga/render-apollo-sandbox'
import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { schema } from './graphql/schema'
import { DataLoaders } from './graphql/shared/data-loaders'

const yoga = createYoga({
	schema,
	context(ctx) {
		const loaders = DataLoaders.createContext()

		return {
			...loaders,
			headers: ctx.request.headers,
		}
	},
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
