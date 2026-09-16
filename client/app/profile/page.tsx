"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Shield, BookOpen, Loader2, Save } from "lucide-react"
import { userApi, ApiError, type User as UserType } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function ProfilePage() {
  const [userDetails, setUserDetails] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editMode, setEditMode] = useState(false)

  const { user, login, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const fetchUserDetails = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError("")

      // Find user in the users list
      const users = await userApi.getAllUsers()
      const currentUser = users.find((u) => u.userId === user.userId || u.email === user.email)

      if (currentUser) {
        setUserDetails(currentUser)
        setFormData({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
        })
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to fetch user details")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userDetails) return

    try {
      setIsSaving(true)
      setError("")
      setSuccess("")

      const updatedUser = await userApi.updateUser(userDetails.userId, {
        ...userDetails,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      })

      setUserDetails(updatedUser)
      login(updatedUser) // Update the auth context
      setEditMode(false)
      setSuccess("Profile updated successfully!")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to update profile")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (userDetails) {
      setFormData({
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
      })
    }
    setEditMode(false)
    setError("")
    setSuccess("")
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      fetchUserDetails()
    }
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userDetails) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-playfair font-bold text-foreground">My Profile</h1>
          </div>
          <p className="text-muted-foreground">Manage your account information and library preferences</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!editMode && (
                    <Button onClick={() => setEditMode(true)} variant="outline">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input value={userDetails.userId} disabled />
                </div>

                {editMode && (
                  <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Type</span>
                  <Badge variant={userDetails.isAdmin ? "default" : "secondary"}>
                    {userDetails.isAdmin ? "Administrator" : "User"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Borrowing Status</span>
                  <Badge variant={userDetails.borrower ? "default" : "destructive"}>
                    {userDetails.borrower ? "Active" : "Suspended"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Outstanding Fines</span>
                  <span className="text-sm font-bold">${userDetails.fineAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <a href="/my-books">View My Books</a>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/explore">Browse Library</a>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/history">Borrowing History</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
