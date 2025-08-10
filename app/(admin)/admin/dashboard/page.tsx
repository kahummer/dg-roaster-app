import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { LogOut, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { AttendanceChart } from '@/components/attendance-chart'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AdminDashboard() {
  // Dummy data for testing
  const groups = [
    {
      id: "1",
      name: "Young Adults DG",
      users: {
        name: "John Doe",
        email: "john@example.com"
      }
    },
    {
      id: "2", 
      name: "College Students DG",
      users: {
        name: "Jane Smith", 
        email: "jane@example.com"
      }
    },
    {
      id: "3",
      name: "Professionals DG",
      users: {
        name: "Mike Johnson",
        email: "mike@example.com"
      }
    }
  ]

  const totalMembers = 15
  const overallAttendanceRate = 78

  const chartData = [
    { date: "2025-08-01", attendanceRate: 85 },
    { date: "2025-08-02", attendanceRate: 72 },
    { date: "2025-08-03", attendanceRate: 90 },
    { date: "2025-08-04", attendanceRate: 68 },
    { date: "2025-08-05", attendanceRate: 82 },
    { date: "2025-08-06", attendanceRate: 76 },
    { date: "2025-08-07", attendanceRate: 88 }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all discipleship groups</p>
        </div>
        <form action={signOut}>
          <Button variant="outline" type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">Active discipleship groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      {chartData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Attendance Trends (Last 7 meetings)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Discipleship Groups</CardTitle>
          <CardDescription>
            Click on a group to view detailed member information and attendance history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No discipleship groups found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Leader Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.users?.name || 'N/A'}</TableCell>
                    <TableCell>{group.users?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/groups/${group.id}`}>
                          View Details
                        </Link>
                      </Button>
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