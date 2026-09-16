export const API_ENDPOINTS = {
  // User endpoints
  USER: {
    BASE: "/api/user",
    LOGIN: "/api/user/login",
    BORROWER: (borrower: boolean) => `/api/user/borrower/${borrower}`,
    BY_ID: (userId: string) => `/api/user/${userId}`,
    IS_ADMIN: (isAdmin: boolean) => `/api/user/isAdmin/${isAdmin}`,
    MAKE_ADMIN: (userId: string) => `/api/user/make-admin/${userId}`,
  },

  // Book endpoints
  BOOK: {
    BASE: "/api/book",
    BY_TITLE: (title: string) => `/api/book/${title}`,
    BY_ID: (bookId: string) => `/api/book/bookId/${bookId}`,
    AVAILABLE: "/api/book/available",
    ISSUED: "/api/book/issued",
    ISSUED_DETAILS: "/api/book/issued/details",
    ISSUE: "/api/book/issue",
    UNISSUE: "/api/book/unissue",
  },
} as const

export const API_CONFIG = {
  BASE_URL: "http://127.0.0.1:8082",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
