"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { StatsOverview } from "@/components/admin/stats-overview"
import { IssuedBooksTable } from "@/components/admin/issued-books-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Plus, Users, BookOpen, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-playfair font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Welcome back, {user.firstName}. Manage your library system from here.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button asChild className="w-full">
                <Link href="/add-book" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Book</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/manage-books" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Manage Books</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/manage-users" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Library Overview</h2>
          <StatsOverview />
        </div>

        {/* Issued Books Table */}
        <div className="mb-8">
          <IssuedBooksTable />
        </div>
      </div>
    </div>
  )
}
