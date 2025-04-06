import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import path from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

import db from './config/connection.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateTokenContext } from './services/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS config
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  console.log('Starting Apollo Server...');

  await server.start();
  console.log('Apollo Server started');

  app.use(
    '/graphql',
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: authenticateTokenContext,
    })
  );

  // Serve frontend static files in production
  if (process.env.NODE_ENV === 'production') {
    const clientDistPath = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDistPath));
  
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Start the server regardless of db.once()
  app.listen(PORT, () => {
    console.log(`MongoDB connected`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
  });

  // Log DB connection errors
  db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
}

startApolloServer();
