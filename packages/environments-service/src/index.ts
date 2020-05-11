import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import { buildFederatedSchema } from './helpers/buildFederatedSchema';
import { ApolloServer } from 'apollo-server-express';
import { ApolloContext } from './graphqlShared/interfaces';
import {
  ConnectionOptions,
  getConnectionOptions,
  createConnection,
} from 'typeorm';

(async (): Promise<void> => {
  try {
    const app = express();
    app.use(cookieParser());
    app.use(express.json());

    const schema = await buildFederatedSchema(
      {
        resolvers: [],
        orphanedTypes: [],
      },
      {
        Environment: {},
      }
    );

    const server = new ApolloServer({
      schema,
      tracing: false,
      playground: true,
      context: ({ req, res }: ApolloContext): ApolloContext => ({
        req,
        res,
      }),
    });

    server.applyMiddleware({ app });

    let connectionOptions: ConnectionOptions = await getConnectionOptions(
      'EnvenvMainDatabase'
    );

    if (process.env.NODE_ENV === 'test') {
      connectionOptions = await getConnectionOptions('EnvenvMockDatabase');
    }

    await createConnection({ ...connectionOptions, name: 'default' });

    app.listen(process.env.SERVICE_PORT, () => {
      console.log(
        `Users service listening on http://localhost:${process.env.SERVICE_PORT}/`
      );
    });
  } catch (error) {
    console.error(error);
  }
})();
