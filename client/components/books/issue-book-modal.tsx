"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, User, BookOpen, Loader2 } from "lucide-react"
import { bookApi, userApi, ApiError, type Book } from "@/lib/api"
import { format, addDays } from "date-fns"

interface IssueBookModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function IssueBookModal({ book, isOpen, onClose, onSuccess }: IssueBookModalProps) {
  const [userId, setUserId] = useState("")
  const [issueDate, setIssueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [returnDate, setReturnDate] = useState(format(addDays(new Date(), 14), "yyyy-MM-dd"))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!book) return

    setIsLoading(true)
    setError("")

    try {
      // Validate user exists
      const users = await userApi.getAllUsers()
      const userExists = users.some((user) => user.userId === userId || user.email === userId)

      if (!userExists) {
        setError("User not found. Please check the User ID or email.")
        setIsLoading(false)
        return
      }

      // Issue the book
      await bookApi.issueBook({
        bookId: book.bookId,
        userId: userId,
        issueDate: new Date(issueDate).toISOString(),
        expectedReturnDate: new Date(returnDate).toISOString(),
      })

      onSuccess()
      onClose()
      resetForm()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to issue book")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setUserId("")
    setIssueDate(format(new Date(), "yyyy-MM-dd"))
    setReturnDate(format(addDays(new Date(), 14), "yyyy-MM-dd"))
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!book) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Issue Book</span>
          </DialogTitle>
          <DialogDescription>Issue "{book.title}" to a library member</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Book Info */}
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="font-medium">{book.title}</h4>
            <p className="text-sm text-muted-foreground">by {book.authorName}</p>
            <p className="text-xs text-muted-foreground">Book ID: {book.bookId}</p>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID or Email *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="userId"
                placeholder="Enter user ID or email"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Return Date */}
          <div className="space-y-2">
            <Label htmlFor="returnDate">Expected Return Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
                min={issueDate}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Issuing...
                </>
              ) : (
                "Issue Book"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
