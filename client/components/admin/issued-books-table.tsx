"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RotateCcw, Calendar, UserIcon, BookIcon } from "lucide-react"
import { bookApi, userApi, ApiError, type Book, type User } from "@/lib/api"
import { format, isAfter, parseISO } from "date-fns"

interface IssuedBookWithUser extends Book {
  userDetails?: User
}

export function IssuedBooksTable() {
  const [issuedBooks, setIssuedBooks] = useState<IssuedBookWithUser[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [unissuingBooks, setUnissuingBooks] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError("")

      const [booksResponse, usersResponse] = await Promise.all([bookApi.getIssuedBooks(), userApi.getAllUsers()])

      setUsers(usersResponse)

      // Enrich books with user details
      const enrichedBooks = booksResponse.map((book) => {
        const userDetails = usersResponse.find((user) => user.userId === book.issuedTo)
        return { ...book, userDetails }
      })

      setIssuedBooks(enrichedBooks)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to fetch issued books")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnissueBook = async (bookId: string) => {
    try {
      setUnissuingBooks((prev) => new Set(prev).add(bookId))
      await bookApi.unissueBook({ bookId })

      // Refresh the data
      await fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to unissue book")
      }
    } finally {
      setUnissuingBooks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(bookId)
        return newSet
      })
    }
  }

  const isOverdue = (expectedReturnDate: string | null) => {
    if (!expectedReturnDate) return false
    return isAfter(new Date(), parseISO(expectedReturnDate))
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMM dd, yyyy")
    } catch {
      return "Invalid Date"
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading issued books...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookIcon className="h-5 w-5" />
          <span>Issued Books</span>
        </CardTitle>
        <CardDescription>Manage all currently issued books and their return status</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {issuedBooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No books are currently issued</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Details</TableHead>
                  <TableHead>Issued To</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issuedBooks.map((book) => (
                  <TableRow key={book.bookId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-muted-foreground">by {book.authorName}</div>
                        <div className="text-xs text-muted-foreground">ID: {book.bookId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {book.userDetails ? (
                            <>
                              <div className="font-medium">
                                {book.userDetails.firstName} {book.userDetails.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{book.userDetails.email}</div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">User ID: {book.issuedTo}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(book.issueDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(book.expectedReturnDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOverdue(book.expectedReturnDate) ? "destructive" : "secondary"}>
                        {isOverdue(book.expectedReturnDate) ? "Overdue" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnissueBook(book.bookId)}
                        disabled={unissuingBooks.has(book.bookId)}
                      >
                        {unissuingBooks.has(book.bookId) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Returning...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Return Book
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
