export let cfg = {
  apiUrl: 'https://45.56.125.220/api',
  tokenName: 'access',
  user: {
    register: '/auth/signup',
    login: '/v1/token/',
    refresh:'/v1/token/refresh/',
    user: '/v1/users/'
  },
  books: '/books'
};
