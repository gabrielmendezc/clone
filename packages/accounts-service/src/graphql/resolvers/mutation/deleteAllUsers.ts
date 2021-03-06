import { ApolloError } from 'apollo-server-express';
import { MutationResolvers, DeleteAllUsersResult } from '../../generated';
import redisClient from '../../../helpers/redisClient';
import { evictCachedUser } from '../../../helpers/cache/user';

const deleteAllUsers: MutationResolvers['deleteAllUsers'] = async (
  _,
  __,
  { prisma }
): Promise<DeleteAllUsersResult> => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      return {
        __typename: 'NotInTestingEnvironment',
        message:
          "Can't execute this operation, this is only available for testing purposes like cleaning up before tests.",
      };
    }

    const cachedUsers = await redisClient.keys('user_*');

    for await (const key of cachedUsers) {
      await evictCachedUser(key.split('_')[1]);
    }

    const deleteOperation = await prisma.user.deleteMany({});

    return {
      __typename: 'SuccessfulRemoval',
      count: deleteOperation.count,
    };
  } catch (error) {
    console.log(error);
    return new ApolloError(
      `Something went wrong on our side, we're working on it!`,
      '500',
      {
        errorCode: 'server_error',
      }
    );
  }
};

export default deleteAllUsers;
