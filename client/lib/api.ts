const API_BASE_URL = "http://127.0.0.1:8082"

export interface User {
  userId: string
  firstName: string
  lastName: string
  email: string
  password: string
  isAdmin: boolean
  borrower: boolean
  fineAmount: number
}

export interface Book {
  bookId: string
  title: string
  authorName: string
  isbn: string
  description: string
  publication: string
  available: boolean
  libraryBook: boolean
  thumbnail: string | null
  issuedTo: string | null
  issueDate: string | null
  expectedReturnDate: string | null
  returnDate: string | null
  status: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  userId: string
  firstName: string
  lastName: string
  email: string
  password: string
  isAdmin: boolean
  borrower: boolean
  fineAmount: number
}

export interface IssueBookRequest {
  bookId: string
  userId: string
  issueDate: string
  expectedReturnDate: string
}

export interface UnissueBookRequest {
  bookId: string
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorText = await response.text()
      throw new ApiError(response.status, errorText || `HTTP ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    }

    return (await response.text()) as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<string> {
    return apiRequest<string>("/api/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  async register(userData: RegisterRequest): Promise<User> {
    return apiRequest<User>("/api/user", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async getUser(userId: string): Promise<User> {
    return apiRequest<User>(`/api/user/${userId}`)
  },
}

export const bookApi = {
  async getAllBooks(): Promise<Book[]> {
    return apiRequest<Book[]>("/api/book")
  },

  async getAvailableBooks(): Promise<Book[]> {
    return apiRequest<Book[]>("/api/book/available")
  },

  async getIssuedBooks(): Promise<Book[]> {
    return apiRequest<Book[]>("/api/book/issued")
  },

  async getIssuedBooksWithDetails(): Promise<Book[]> {
    return apiRequest<Book[]>("/api/book/issued/details")
  },

  async getBookById(bookId: string): Promise<Book> {
    return apiRequest<Book>(`/api/book/bookId/${bookId}`)
  },

  async getBooksByTitle(title: string): Promise<Book[]> {
    return apiRequest<Book[]>(`/api/book/${title}`)
  },

  async createBook(book: Omit<Book, "bookId">): Promise<Book> {
    console.log("[v0] API: Creating book with data:", book)
    try {
      const result = await apiRequest<Book>("/api/book", {
        method: "POST",
        body: JSON.stringify(book),
      })
      console.log("[v0] API: Book created successfully:", result)
      return result
    } catch (error) {
      console.log("[v0] API: Error creating book:", error)
      throw error
    }
  },

  async updateBook(bookId: string, book: Partial<Book>): Promise<Book> {
    return apiRequest<Book>(`/api/book/${bookId}`, {
      method: "PUT",
      body: JSON.stringify(book),
    })
  },

  async deleteBook(bookId: string): Promise<void> {
    return apiRequest<void>(`/api/book/${bookId}`, {
      method: "DELETE",
    })
  },

  async issueBook(request: IssueBookRequest): Promise<Book> {
    return apiRequest<Book>("/api/book/issue", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  async unissueBook(request: UnissueBookRequest): Promise<Book> {
    return apiRequest<Book>("/api/book/unissue", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },
}

export const userApi = {
  async getAllUsers(): Promise<User[]> {
    return apiRequest<User[]>("/api/user")
  },

  async getBorrowerUsers(borrower: boolean): Promise<User[]> {
    return apiRequest<User[]>(`/api/user/borrower/${borrower}`)
  },

  async getAdminUsers(isAdmin: boolean): Promise<User[]> {
    return apiRequest<User[]>(`/api/user/isAdmin/${isAdmin}`)
  },

  async updateUser(userId: string, user: Partial<User>): Promise<User> {
    return apiRequest<User>(`/api/user/${userId}`, {
      method: "PUT",
      body: JSON.stringify(user),
    })
  },

  async deleteUser(userId: string): Promise<void> {
    return apiRequest<void>(`/api/user/${userId}`, {
      method: "DELETE",
    })
  },

  async makeAdmin(userId: string): Promise<User> {
    return apiRequest<User>(`/api/user/make-admin/${userId}`, {
      method: "PUT",
    })
  },
}

export { ApiError }
