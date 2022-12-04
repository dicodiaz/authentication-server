import { User } from './db.js';

const rejectIf = (condition) => {
  if (condition) {
    throw new Error('Unauthorized');
  }
};

export const resolvers = {
  Query: {
    user: (_root, { userId }, { user }) => {
      rejectIf(!user || user.id !== userId);
      return User.findById(userId);
    },
  },

  Mutation: {
    createUser: (_root, { createUserInput }) => {
      return User.create({ ...createUserInput });
    },
  },
};
