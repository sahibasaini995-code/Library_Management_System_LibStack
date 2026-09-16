"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { bookApi, userApi } from "@/lib/api"
import { isAfter, parseISO } from "date-fns"

interface Stats {
  totalBooks: number
  availableBooks: number
  issuedBooks: number
  overdueBooks: number
  totalUsers: number
  borrowers: number
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    totalUsers: 0,
    borrowers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setIsLoading(true)

      const [allBooks, availableBooks, issuedBooks, allUsers, borrowers] = await Promise.all([
        bookApi.getAllBooks().catch(() => []),
        bookApi.getAvailableBooks().catch(() => []),
        bookApi.getIssuedBooks().catch(() => []),
        userApi.getAllUsers().catch(() => []),
        userApi.getBorrowerUsers(true).catch(() => []),
      ])

      // Calculate overdue books
      const overdueBooks = issuedBooks.filter((book) => {
        if (!book.expectedReturnDate) return false
        return isAfter(new Date(), parseISO(book.expectedReturnDate))
      })

      setStats({
        totalBooks: allBooks.length,
        availableBooks: availableBooks.length,
        issuedBooks: issuedBooks.length,
        overdueBooks: overdueBooks.length,
        totalUsers: allUsers.length,
        borrowers: borrowers.length,
      })
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      description: "Books in library",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Available",
      value: stats.availableBooks,
      description: "Ready to borrow",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Issued",
      value: stats.issuedBooks,
      description: "Currently borrowed",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Overdue",
      value: stats.overdueBooks,
      description: "Past return date",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Active Borrowers",
      value: stats.borrowers,
      description: "Can borrow books",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
