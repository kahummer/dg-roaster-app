import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AttendanceForm } from '@/components/attendance-form'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

export default async function AttendancePage() {
  // Dummy data for testing
  const group = {
    id: "1",
    name: "Young Adults DG"
  }

  const members = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@email.com",
      phone: "+1234567890"
    },
    {
      id: "2", 
      name: "Bob Smith",
      email: "bob@email.com",
      phone: "+1987654321"
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@email.com", 
      phone: "+1122334455"
    },
    {
      id: "4",
      name: "David Wilson",
      email: "david@email.com",
      phone: null
    },
    {
      id: "5",
      name: "Eva Brown",
      email: null,
      phone: "+1555666777"
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="sm" className="mr-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Take Attendance</h1>
          <p className="text-muted-foreground">Group: {group.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mark Attendance ({members.length} members)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No members in your group yet.
              </p>
              <Button asChild>
                <Link href="/">
                  Add Members First
                </Link>
              </Button>
            </div>
          ) : (
            <AttendanceForm members={members} groupId={group.id} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}