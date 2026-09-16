"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Plus, BookMarked, LogIn, UserPlus, Home, Compass, LogOut, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout, isAdmin } = useAuth()

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-playfair font-bold text-2xl text-foreground">LibStack</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:ring-primary"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore" className="flex items-center space-x-1">
                <Compass className="h-4 w-4" />
                <span>Explore</span>
              </Link>
            </Button>

            {user && isAdmin && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/add-book" className="flex items-center space-x-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Book</span>
                  </Link>
                </Button>
              </>
            )}

            {user && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-books" className="flex items-center space-x-1">
                  <BookMarked className="h-4 w-4" />
                  <span>My Books</span>
                </Link>
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    {user.firstName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" className="flex items-center space-x-1">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </Button>

                <Button size="sm" asChild>
                  <Link href="/signup" className="flex items-center space-x-1">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
