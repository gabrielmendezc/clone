import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildFederatedSchema } from './helpers/buildFederatedSchema';
import Auth, { resolveAuthReference } from './entities/Auth';
import AuthResolver from './resolvers/Auth';
import express from 'express';
import { rateLimiter } from './middlewares/rateLimit';
import helmet from 'helmet';
import passport from 'passport';
import {
  GoogleStrategyObj,
  FacebookStrategyObj,
} from './middlewares/passportStrategies';

//TODO integrate passport callbacks with Apollo

(async () => {
  passport.use(GoogleStrategyObj);
  passport.use(FacebookStrategyObj);
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use(rateLimiter);
  app.use(passport.initialize());
  app.use(passport.session());
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['https://www.googleapis.com/auth/plus.login'],
    })
  );
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      console.log(req);
      res.redirect('/');
    }
  );
  app.get('/auth/facebook', passport.authenticate('facebook'));
  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/login',
    })
  );
  //TODO fix success routes, types and serialize/deserialize functions
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  const schema = await buildFederatedSchema(
    {
      resolvers: [AuthResolver],
      orphanedTypes: [Auth],
    },
    {
      Auth: { __resolveReference: resolveAuthReference },
    }
  );

  const server = new ApolloServer({
    schema,
    tracing: false,
    playground: true,
  });
  server.applyMiddleware({ app });

  app.listen(process.env.SERVICE_PORT, function () {
    console.log(
      `Node server running on http://localhost:${process.env.SERVICE_PORT}`
    );
  });
})();