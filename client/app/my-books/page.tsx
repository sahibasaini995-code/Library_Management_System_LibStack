"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { BookOpen, User, Calendar, Clock, CheckCircle, AlertTriangle, Search, RotateCcw } from "lucide-react"
import { bookApi, userApi, ApiError, type Book, type User as UserType } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { format, parseISO, differenceInDays } from "date-fns"
import Link from "next/link"

export default function MyBooksPage() {
  const [issuedBooks, setIssuedBooks] = useState<Book[]>([])
  const [userDetails, setUserDetails] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [returningBooks, setReturningBooks] = useState<Set<string>>(new Set())

  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const fetchUserBooks = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError("")

      const [allIssuedBooks, userDetailsResponse] = await Promise.all([
        bookApi.getIssuedBooks(),
        userApi.getAllUsers().then((users) => users.find((u) => u.userId === user.userId || u.email === user.email)),
      ])

      const userBooks = allIssuedBooks.filter((book) => book.issuedTo === user.userId || book.issuedTo === user.email)

      setIssuedBooks(userBooks)
      if (userDetailsResponse) {
        setUserDetails(userDetailsResponse)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to fetch your books")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturnBook = async (bookId: string) => {
    try {
      setReturningBooks((prev) => new Set(prev).add(bookId))
      setError("")

      await bookApi.unissueBook({ bookId })

      await fetchUserBooks()

      setError("")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to return book: ${err.message}`)
      } else {
        setError("Failed to return book")
      }
    } finally {
      setReturningBooks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(bookId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMM dd, yyyy")
    } catch {
      return "Invalid Date"
    }
  }

  const getDaysUntilDue = (expectedReturnDate: string | null) => {
    if (!expectedReturnDate) return null
    try {
      const dueDate = parseISO(expectedReturnDate)
      const today = new Date()
      return differenceInDays(dueDate, today)
    } catch {
      return null
    }
  }

  const getBookStatus = (book: Book) => {
    if (!book.expectedReturnDate) return { status: "active", color: "secondary" }

    const daysUntilDue = getDaysUntilDue(book.expectedReturnDate)
    if (daysUntilDue === null) return { status: "active", color: "secondary" }

    if (daysUntilDue < 0) {
      return { status: `Overdue by ${Math.abs(daysUntilDue)} days`, color: "destructive" }
    } else if (daysUntilDue === 0) {
      return { status: "Due today", color: "destructive" }
    } else if (daysUntilDue <= 3) {
      return { status: `Due in ${daysUntilDue} days`, color: "secondary" }
    } else {
      return { status: `Due in ${daysUntilDue} days`, color: "default" }
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      fetchUserBooks()
    }
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your books...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const overdueBooks = issuedBooks.filter((book) => {
    const daysUntilDue = getDaysUntilDue(book.expectedReturnDate)
    return daysUntilDue !== null && daysUntilDue < 0
  })

  const dueSoonBooks = issuedBooks.filter((book) => {
    const daysUntilDue = getDaysUntilDue(book.expectedReturnDate)
    return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-playfair font-bold text-foreground">My Library</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName}! Here are your borrowed books and library activity.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{issuedBooks.length}</div>
              <p className="text-xs text-muted-foreground">Currently in your possession</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueSoonBooks.length}</div>
              <p className="text-xs text-muted-foreground">Due within 3 days</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueBooks.length}</div>
              <p className="text-xs text-muted-foreground">Past return date</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fine Amount</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userDetails?.fineAmount?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Outstanding fines</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button asChild className="w-full">
                <Link href="/explore" className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Browse Books</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/history" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Borrowing History</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Your Borrowed Books</span>
            </CardTitle>
            <CardDescription>Books currently checked out to you</CardDescription>
          </CardHeader>
          <CardContent>
            {issuedBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No books borrowed</h3>
                <p className="text-muted-foreground mb-4">You haven't borrowed any books yet.</p>
                <Button asChild>
                  <Link href="/explore">Browse Available Books</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {issuedBooks.map((book) => {
                  const bookStatus = getBookStatus(book)
                  const isReturning = returningBooks.has(book.bookId)

                  return (
                    <div key={book.bookId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-4 flex-1">
                          <div className="w-16 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            {book.thumbnail ? (
                              <img
                                src={book.thumbnail || "/placeholder.svg"}
                                alt={book.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <BookOpen className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                            <p className="text-muted-foreground mb-2">by {book.authorName}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">Issue Date</p>
                                  <p className="text-muted-foreground">{formatDate(book.issueDate)}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">Due Date</p>
                                  <p className="text-muted-foreground">{formatDate(book.expectedReturnDate)}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">Status</p>
                                  <Badge variant={bookStatus.color as any}>{bookStatus.status}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Button
                            onClick={() => handleReturnBook(book.bookId)}
                            disabled={isReturning}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            {isReturning ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span>Returning...</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4" />
                                <span>Return Book</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
