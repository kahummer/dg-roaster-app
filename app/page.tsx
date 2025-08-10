import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddMemberDialog } from '@/components/add-member-dialog'
import Link from 'next/link'
import { LogOut, Users, Calendar } from 'lucide-react'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function Dashboard() {
  // Dummy data for testing
  const userProfile = {
    name: "John Doe",
    email: "john@example.com"
  }

  const group = {
    id: "1",
    name: "Young Adults DG",
    leader_id: "123"
  }

  const members = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@email.com",
      phone: "+1234567890",
      created_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "2", 
      name: "Bob Smith",
      email: "bob@email.com",
      phone: "+1987654321",
      created_at: "2025-01-02T00:00:00Z"
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@email.com", 
      phone: "+1122334455",
      created_at: "2025-01-03T00:00:00Z"
    },
    {
      id: "4",
      name: "David Wilson",
      email: "david@email.com",
      phone: null,
      created_at: "2025-01-04T00:00:00Z"
    },
    {
      id: "5",
      name: "Eva Brown",
      email: null,
      phone: "+1555666777",
      created_at: "2025-01-05T00:00:00Z"
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">DG Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {userProfile.name || userProfile.email}</p>
          <p className="text-sm text-muted-foreground">Group: {group.name}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/attendance">
              <Calendar className="h-4 w-4 mr-2" />
              Take Attendance
            </Link>
          </Button>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Members ({members.length})
            </CardTitle>
            <AddMemberDialog groupId={group.id} />
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No members added yet. Click "Add Member" to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email || '-'}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
