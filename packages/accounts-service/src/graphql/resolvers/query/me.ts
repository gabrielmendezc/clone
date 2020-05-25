import { QueryResolvers, User } from '../../generated';
import { ApolloError } from 'apollo-server-express';
import { getCachedUser } from '../../../helpers/cache/user';

const me: QueryResolvers['me'] = async (_, __, { auth, prisma }) => {
  try {
    let user = await getCachedUser(auth.userId);

    if (user) {
      return {
        __typename: 'User',
        id: user?.id,
        name: user?.name,
        password: user?.password,
        provider: user?.provider,
        role: user?.role,
        username: user?.username,
        email: user?.email,
        lastPasswordChange: user?.lastPasswordChange,
        picture: user?.picture,
      } as User;
    }

    user = await prisma.user.findOne({ where: { id: auth.userId } });

    return {
      __typename: 'User',
      id: user?.id,
      name: user?.name,
      password: user?.password,
      provider: user?.provider,
      role: user?.role,
      username: user?.username,
      email: user?.email,
      lastPasswordChange: user?.lastPasswordChange,
      picture: user?.picture,
    } as User;
  } catch (error) {
    throw new ApolloError(
      `Something went wrong on our side, we're working on it!`,
      '500',
      {
        errorCode: 'server_error',
      }
    );
  }
};

export default me;