import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import path from 'node:path';
import dotenv from 'dotenv';

import db from './config/connection.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateTokenContext } from './services/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS config
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apollo setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  console.log('Starting Apollo Server...');

  await server.start();

  app.use(
    '/graphql',
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: authenticateTokenContext,
    })
  );

  // Serve frontend in production
  if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, 'client', 'build')));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
  }

  // db.once('open', () => {
    console.log('MongoDB connected ✅');
  
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`GraphQL at http://localhost:${PORT}/graphql`);
    });
  // });
  
  db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
}

startApolloServer();
