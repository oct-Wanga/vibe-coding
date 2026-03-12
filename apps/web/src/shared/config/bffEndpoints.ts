export const bffEndpoints = {
  health: "/api/health",
  auth: {
    login: "/api/auth/login",
    signup: "/api/auth/signup",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  projects: {
    list: "/api/projects",
    detail: (id: string) => `/api/projects/${id}`,
  },
} as const;
