"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, User, Calendar, Edit, Trash2, RotateCcw } from "lucide-react"
import type { Book } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { format, parseISO } from "date-fns"

interface BookCardProps {
  book: Book
  onEdit?: (book: Book) => void
  onDelete?: (bookId: string) => void
  onIssue?: (book: Book) => void
  onReturn?: (bookId: string) => void
  showActions?: boolean
}

export function BookCard({ book, onEdit, onDelete, onIssue, onReturn, showActions = true }: BookCardProps) {
  const { isAdmin } = useAuth()
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMM dd, yyyy")
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusBadge = () => {
    if (book.available) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
    } else {
      return <Badge variant="destructive">Issued</Badge>
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4 flex-1">
        {/* Book Cover */}
        <div className="aspect-[3/4] bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
          {book.thumbnail && !imageError ? (
            <img
              src={book.thumbnail || "/placeholder.svg"}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        {/* Book Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{book.title}</h3>
            {getStatusBadge()}
          </div>

          <p className="text-sm text-muted-foreground">by {book.authorName}</p>

          {book.publication && <p className="text-xs text-muted-foreground">Published by {book.publication}</p>}

          {book.isbn && <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>}

          {book.description && <p className="text-xs text-muted-foreground line-clamp-3">{book.description}</p>}

          {/* Issue Information */}
          {!book.available && book.issuedTo && (
            <div className="mt-3 p-2 bg-muted/50 rounded-md">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Issued to: {book.issuedTo}</span>
              </div>
              {book.issueDate && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Issue Date: {formatDate(book.issueDate)}</span>
                </div>
              )}
              {book.expectedReturnDate && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Expected Return: {formatDate(book.expectedReturnDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            {book.available ? (
              <Button size="sm" className="flex-1" onClick={() => onIssue?.(book)}>
                Issue Book
              </Button>
            ) : (
              isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => onReturn?.(book.bookId)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Return
                </Button>
              )
            )}

            {isAdmin && (
              <>
                <Button size="sm" variant="outline" onClick={() => onEdit?.(book)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete?.(book.bookId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
