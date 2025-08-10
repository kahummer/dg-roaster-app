import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function GroupDetailPage({ params }: Props) {
  const resolvedParams = await params
  const { groupId } = resolvedParams
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get the user's profile to check role
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userProfile || userProfile.role !== 'ADMIN') {
    redirect('/')
  }

  // Get group details with leader info
  const { data: group } = await supabase
    .from('discipleship_groups')
    .select(`
      *,
      users!discipleship_groups_leader_id_fkey (
        name,
        email
      )
    `)
    .eq('id', groupId)
    .single()

  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Group not found.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get members of the group
  const { data: members = [] } = await supabase
    .from('members')
    .select('*')
    .eq('group_id', groupId)
    .order('name')

  // Get attendance records for this group
  const { data: attendanceRecords = [] } = await supabase
    .from('attendance_records')
    .select(`
      *,
      members!inner (
        id,
        name,
        group_id
      )
    `)
    .eq('members.group_id', groupId)
    .order('meeting_date', { ascending: false })
    .limit(100)

  // Calculate attendance statistics
  const totalRecords = attendanceRecords.length
  const presentCount = attendanceRecords.filter(record => record.present).length
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0

  // Group attendance by date for recent meetings
  const attendanceByDate = attendanceRecords.reduce((acc, record) => {
    const date = record.meeting_date
    if (!acc[date]) {
      acc[date] = { date, total: 0, present: 0, members: [] }
    }
    acc[date].total++
    if (record.present) {
      acc[date].present++
      acc[date].members.push(record.members.name)
    }
    return acc
  }, {} as Record<string, { date: string; total: number; present: number; members: string[] }>)

  const recentMeetings = Object.values(attendanceByDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="sm" className="mr-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">
            Led by {group.users?.name || 'N/A'} ({group.users?.email || 'N/A'})
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Recorded meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No members in this group yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>{member.phone || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Meetings
            </CardTitle>
            <CardDescription>Latest attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMeetings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No attendance records found.
              </p>
            ) : (
              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <div key={meeting.date} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          {format(new Date(meeting.date), 'MMMM dd, yyyy')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(meeting.date), 'EEEE')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {meeting.present}/{meeting.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((meeting.present / meeting.total) * 100)}% present
                        </div>
                      </div>
                    </div>
                    {meeting.members.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Present: {meeting.members.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}