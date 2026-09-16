"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, CheckCircle, Clock } from "lucide-react"
import { bookApi } from "@/lib/api"
import Link from "next/link"

export default function HomePage() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
  })

  const fetchStats = async () => {
    try {
      const [allBooks, availableBooks, issuedBooks] = await Promise.all([
        bookApi.getAllBooks().catch(() => []),
        bookApi.getAvailableBooks().catch(() => []),
        bookApi.getIssuedBooks().catch(() => []),
      ])

      setStats({
        totalBooks: allBooks.length,
        availableBooks: availableBooks.length,
        issuedBooks: issuedBooks.length,
      })
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <h1 className="font-playfair text-5xl font-bold text-foreground mb-6 text-balance">
                Welcome to <span className="text-primary">LibStack</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Your digital gateway to endless knowledge and stories
              </p>

              <div className="flex gap-4">
                <Button size="lg" asChild className="animate-fade-in">
                  <Link href="/explore" className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Explore Books</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="animate-fade-in animation-delay-200 bg-transparent"
                >
                  <Link href="/add-book" className="flex items-center space-x-2">
                    <span>Add New Book</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Book Illustrations */}
            <div className="hidden lg:flex items-center space-x-4 animate-float">
              <div className="w-16 h-20 bg-primary rounded-md shadow-lg transform rotate-12"></div>
              <div className="w-16 h-20 bg-accent rounded-md shadow-lg transform -rotate-6"></div>
              <div className="w-16 h-20 bg-chart-3 rounded-md shadow-lg transform rotate-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">{stats.totalBooks}</h3>
                <p className="text-muted-foreground">Total Books</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-chart-2" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">{stats.availableBooks}</h3>
                <p className="text-muted-foreground">Available</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">{stats.issuedBooks}</h3>
                <p className="text-muted-foreground">Issued</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
