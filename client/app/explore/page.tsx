"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { BookCard } from "@/components/books/book-card"
import { IssueBookModal } from "@/components/books/issue-book-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, BookOpen, Loader2, RefreshCw } from "lucide-react"
import { bookApi, ApiError, type Book } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function ExplorePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)

  const { user, isAdmin } = useAuth()

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      setError("")
      const booksData = await bookApi.getAllBooks()
      setBooks(booksData)
      setFilteredBooks(booksData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to fetch books")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books)
      return
    }

    try {
      const searchResults = await bookApi.getBooksByTitle(searchQuery)
      setFilteredBooks(searchResults)
    } catch (err) {
      // If search fails, filter locally
      const localResults = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.authorName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredBooks(localResults)
    }
  }

  const applyFilters = () => {
    let filtered = searchQuery ? filteredBooks : books

    if (statusFilter === "available") {
      filtered = filtered.filter((book) => book.available)
    } else if (statusFilter === "issued") {
      filtered = filtered.filter((book) => !book.available)
    }

    if (!searchQuery) {
      setFilteredBooks(filtered)
    }
  }

  const handleIssueBook = (book: Book) => {
    setSelectedBook(book)
    setIsIssueModalOpen(true)
  }

  const handleReturnBook = async (bookId: string) => {
    try {
      await bookApi.unissueBook({ bookId })
      await fetchBooks() // Refresh the list
    } catch (err) {
      console.error("Failed to return book:", err)
    }
  }

  const handleEditBook = (book: Book) => {
    // This would open an edit book modal/form
    console.log("Edit book:", book)
  }

  const handleDeleteBook = async (bookId: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await bookApi.deleteBook(bookId)
        await fetchBooks() // Refresh the list
      } catch (err) {
        console.error("Failed to delete book:", err)
      }
    }
  }

  const handleIssueSuccess = () => {
    fetchBooks() // Refresh the books list
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [statusFilter, books])

  useEffect(() => {
    if (searchQuery) {
      handleSearch()
    } else {
      applyFilters()
    }
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">Explore Books</h1>
              <p className="text-muted-foreground">Discover and manage your library collection</p>
            </div>
            <Button onClick={fetchBooks} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Books</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleSearch} variant="outline">
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading books...</span>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBooks.length} of {books.length} books
              </p>
            </div>

            {/* Books Grid */}
            {filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "No books available in the library"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.bookId}
                    book={book}
                    onIssue={handleIssueBook}
                    onReturn={handleReturnBook}
                    onEdit={handleEditBook}
                    onDelete={handleDeleteBook}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Issue Book Modal */}
      <IssueBookModal
        book={selectedBook}
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={handleIssueSuccess}
      />
    </div>
  )
}
