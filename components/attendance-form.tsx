'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitAttendance } from '@/app/actions/submit-attendance'

interface Member {
  id: string
  name: string
  email?: string
  phone?: string
}

interface AttendanceFormProps {
  members: Member[]
  groupId: string
}

export function AttendanceForm({ members, groupId }: AttendanceFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendeeIds, setAttendeeIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    const newAttendeeIds = new Set(attendeeIds)
    if (checked) {
      newAttendeeIds.add(memberId)
    } else {
      newAttendeeIds.delete(memberId)
    }
    setAttendeeIds(newAttendeeIds)
  }

  const handleSubmit = async () => {
    if (!selectedDate) {
      alert('Please select a meeting date')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('groupId', groupId)
      formData.append('meetingDate', selectedDate.toISOString().split('T')[0])
      
      attendeeIds.forEach(memberId => {
        formData.append('attendeeIds', memberId)
      })

      await submitAttendance(formData)
      
      // Reset form
      setAttendeeIds(new Set())
      alert('Attendance recorded successfully!')
    } catch (error) {
      console.error('Error submitting attendance:', error)
      alert('Failed to record attendance. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="space-y-2">
        <Label>Meeting Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Member List */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Select Members Present ({attendeeIds.size} of {members.length})
        </Label>
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={member.id}
                checked={attendeeIds.has(member.id)}
                onCheckedChange={(checked) => 
                  handleMemberToggle(member.id, checked as boolean)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor={member.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {member.name}
                </Label>
                {member.email && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {member.email}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {attendeeIds.size} of {members.length} members selected
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !selectedDate}
          className="min-w-[120px]"
        >
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </>
          )}
        </Button>
      </div>
    </div>
  )
}