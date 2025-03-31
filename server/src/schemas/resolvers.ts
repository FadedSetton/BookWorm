import { IResolvers } from '@graphql-tools/utils';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

const resolvers: IResolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return await User.findById(context.user._id);
    },
  },

  Mutation: {
    addUser: async (_parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (err) {
        console.error(err);
        throw new Error('Unable to create user');
      }
    },

    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('No user found with that email');
      }

      const validPassword = await user.isCorrectPassword(password);
      if (!validPassword) {
        throw new Error('Incorrect password');
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    saveBook: async (_parent, { bookData }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    removeBook: async (_parent, { bookId }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

export default resolvers;
