import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import connectDatabase from './helpers/connectDatabase';
import { ApolloContext } from './typings';
import User from './entities/User';
import { buildFederatedSchema } from '@apollo/federation';
import typeDefs from './graphql/typeDefs';
import passport from 'passport';
import { callbackGoogleAuth, scopeFn } from './controllers/auth/google';
import { GoogleStrategyObj } from './middlewares/passportStrategies';

(async (): Promise<void> => {
  try {
    const app = express();
    app.use(cookieParser());
    app.use(express.json());

    passport.use(GoogleStrategyObj);
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/auth/google', scopeFn());
    app.get(
      '/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      callbackGoogleAuth
    );

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      done(null, user);
    });

    const server = new ApolloServer({
      schema: buildFederatedSchema([
        {
          typeDefs,
          resolvers: {
            Query: {
              me() {
                return {
                  id: '1',
                  picture: '',
                  provider: 'none',
                  username: 'gabrielmendezc',
                  email: 'yo@gabrielmendezc.com',
                  name: 'Gabriel',
                  password: 'Gabriel123',
                  role: 'ADMIN',
                };
              },
            },
            User: {
              __resolveReference(user) {
                return User.find({ where: { id: user.id } });
              },
            },
          },
        },
      ]),
      context: ({ req, res }: ApolloContext): ApolloContext => ({
        req,
        res,
      }),
    });

    server.applyMiddleware({ app });

    await connectDatabase();

    const PORT = process.env.SERVICE_PORT;
    app.listen(PORT, () => {
      console.log(`Users service listening on http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(error);
  }
})();