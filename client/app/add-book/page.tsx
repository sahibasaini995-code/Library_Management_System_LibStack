"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Loader2, Plus } from "lucide-react"
import { bookApi, ApiError } from "@/lib/api"

interface BookFormData {
  title: string
  authorName: string
  isbn: string
  description: string
  publication: string
  thumbnail: string
  available: boolean
  libraryBook: boolean
}

export default function AddBookPage() {
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    authorName: "",
    isbn: "",
    description: "",
    publication: "",
    thumbnail: "",
    available: true,
    libraryBook: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  const handleInputChange = (field: keyof BookFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    // Basic validation
    if (!formData.title.trim() || !formData.authorName.trim()) {
      setError("Title and author are required")
      setIsLoading(false)
      return
    }
function getRandomString(length:number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
    try {
      const bookData = {
        title: formData.title.trim(),
        authorName: formData.authorName.trim(),
        bookId:getRandomString(4),
        isbn: formData.isbn.trim(),
        description: formData.description.trim(),
        publication: formData.publication.trim(),
        thumbnail: formData.thumbnail.trim() || null,
        available: formData.available,
        libraryBook: formData.libraryBook,
        issuedTo: null,
        issueDate: null,
        expectedReturnDate: null,
        returnDate: null,
        status: formData.available ? "available" : "unavailable",
      }

      console.log("[v0] Sending book data:", bookData)
      const result = await bookApi.createBook(bookData)
      console.log("[v0] Book created successfully:", result)

      setSuccess(true)

      // Reset form
      setFormData({
        title: "",
        authorName: "",
        isbn: "",
        description: "",
        publication: "",
        thumbnail: "",
        available: true,
        libraryBook: true,
      })

      // Redirect after success
      setTimeout(() => {
        router.push("/explore")
      }, 2000)
    } catch (err) {
      console.log("[v0] Error creating book:", err)
      if (err instanceof ApiError) {
        setError(`Failed to add book: ${err.message}`)
      } else {
        setError("Failed to add book. Please check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-playfair font-bold text-foreground">Add New Book</h1>
          </div>
          <p className="text-muted-foreground">Add a new book to the library collection</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Book Information</span>
            </CardTitle>
            <CardDescription>Fill in the details for the new book</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>Book added successfully! Redirecting to explore page...</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter book title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authorName">Author *</Label>
                    <Input
                      id="authorName"
                      placeholder="Enter author name"
                      value={formData.authorName}
                      onChange={(e) => handleInputChange("authorName", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      placeholder="Enter ISBN"
                      value={formData.isbn}
                      onChange={(e) => handleInputChange("isbn", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publication">Publisher</Label>
                    <Input
                      id="publication"
                      placeholder="Enter publisher name"
                      value={formData.publication}
                      onChange={(e) => handleInputChange("publication", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Cover Image URL</Label>
                  <Input
                    id="thumbnail"
                    placeholder="Enter cover image URL"
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange("thumbnail", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter book description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => handleInputChange("available", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="available">Book is available for borrowing</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="libraryBook"
                    checked={formData.libraryBook}
                    onCheckedChange={(checked) => handleInputChange("libraryBook", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="libraryBook">This is a library book</Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Book...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Book
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => router.push("/explore")} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
