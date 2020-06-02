import {
  useWhoAmILazyQuery,
  WhoAmIQueryVariables,
  WhoAmIQuery,
  useLogoutOnClientMutation,
  useLogoutMutation,
  useSignUpMutation,
  SignUpMutationFn,
  useLoginOnClientMutation,
  SignUpMutation,
  LoginOnClientMutationFn,
} from '../generated/graphql';
import { QueryLazyOptions, ApolloError, NetworkStatus } from '@apollo/client';

interface UseAuthHook {
  whoAmI: {
    execute: (
      options?: QueryLazyOptions<WhoAmIQueryVariables> | undefined
    ) => void;
    data: WhoAmIQuery | undefined;
    loading: boolean;
    error: ApolloError | undefined;
    networkStatus: NetworkStatus;
    called: boolean;
  };
  logout: {
    execute: () => void;
    loading: boolean;
    error: {
      onClient: ApolloError | undefined;
      onAPI: ApolloError | undefined;
    };
  };
  signup: {
    execute: SignUpMutationFn;
    loading: boolean;
    error: ApolloError | undefined;
    data: SignUpMutation | null | undefined;
  };
  updateClientCacheForUserLogin: {
    execute: LoginOnClientMutationFn;
    loading: boolean;
  };
  logoutAsync: {
    execute: () => Promise<void>;
    loading: boolean;
    error: {
      onClient: ApolloError | undefined;
      onAPI: ApolloError | undefined;
    };
  };
}

export function useAuth(): UseAuthHook {
  const [
    whoAmI,
    {
      data: whoAmIResult,
      loading: whoAmILoadingStatus,
      error: whoAmIError,
      networkStatus: whoAmINetworkStatus,
      called: whoAmICalled,
    },
  ] = useWhoAmILazyQuery();

  const [
    updateClientCacheForAuthentication,
    { loading: updateClientCacheForAuthenticationLoading },
  ] = useLoginOnClientMutation();

  const [
    logoutOnAPI,
    { loading: logoutOnAPILoadingStatus, error: logoutOnAPIError },
  ] = useLogoutMutation();

  const [
    logoutOnClient,
    { loading: logoutOnClientLoadingStatus, error: logoutOnClientError },
  ] = useLogoutOnClientMutation();

  const [
    signup,
    { loading: signupLoadingStatus, error: signupError, data: signupData },
  ] = useSignUpMutation({
    onCompleted: data => {
      if (data.signup.__typename === 'SuccessfulSignup') {
        updateClientCacheForAuthentication({
          variables: { csrfToken: data.signup.csrfToken },
        });
      }
    },
  });

  const logout = () => {
    logoutOnAPI();
    logoutOnClient();
  };

  const logoutAsync = async () => {
    await logoutOnAPI();
    await logoutOnClient();
  };

  return {
    whoAmI: {
      execute: whoAmI,
      data: whoAmIResult,
      loading: whoAmILoadingStatus,
      error: whoAmIError,
      networkStatus: whoAmINetworkStatus,
      called: whoAmICalled,
    },
    logout: {
      execute: logout,
      loading: logoutOnAPILoadingStatus || logoutOnClientLoadingStatus,
      error: {
        onAPI: logoutOnAPIError,
        onClient: logoutOnClientError,
      },
    },
    signup: {
      execute: signup,
      loading: signupLoadingStatus,
      error: signupError,
      data: signupData,
    },
    updateClientCacheForUserLogin: {
      execute: updateClientCacheForAuthentication,
      loading: updateClientCacheForAuthenticationLoading,
    },
    logoutAsync: {
      execute: logoutAsync,
      loading: logoutOnAPILoadingStatus || logoutOnClientLoadingStatus,
      error: {
        onAPI: logoutOnAPIError,
        onClient: logoutOnClientError,
      },
    },
  };
}
