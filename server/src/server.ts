import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import {typeDefs, resolvers} from './schemas/index.js';
import { authenticateTokenContext } from './services/auth.js';



const app = express();
const PORT = process.env.PORT || 3001;

const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: authenticateTokenContext,
    })
  );
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

db.once('open', async () => {
  await startApolloServer();
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  })
})

