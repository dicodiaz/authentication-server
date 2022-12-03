import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { expressjwt } from 'express-jwt';
import { readFile } from 'fs/promises';
import jwt from 'jsonwebtoken';
import { User } from './db.js';
import { resolvers } from './resolvers.js';

dotenv.config({ path: './.env' });
const PORT = 9000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME;

const app = express();
app.use(
  cors(),
  express.json(),
  expressjwt({
    algorithms: ['HS256'],
    credentialsRequired: false,
    secret: JWT_SECRET,
  }),
);

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne((user) => user.email === email);
  if (user?.password === password) {
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

const typeDefs = await readFile('./schema.graphql', 'utf8');
const context = async ({ req }) => {
  if (req.auth) {
    const user = await User.findById(req.auth.sub);
    return { user };
  }
  return {};
};
const apolloServer = new ApolloServer({ typeDefs, resolvers, context });
await apolloServer.start();
apolloServer.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
