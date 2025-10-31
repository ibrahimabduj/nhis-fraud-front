import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconFilter } from '@tabler/icons-react'

type FilterState = {
  patientId: string
  gender: string
  diagnosis: string
  minScore: string
  maxScore: string
  scoreCategory: string
  startDate: string
  endDate: string
}

type ClaimsFiltersProps = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClear: () => void
}

export function ClaimsFilters({ filters, onFiltersChange, onClear }: ClaimsFiltersProps) {
  const [open, setOpen] = useState(false)

  function handleChange(key: keyof FilterState, value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  function handleScoreCategoryChange(value: string) {
    if (value === 'LOW') {
      handleChange('minScore', '0')
      handleChange('maxScore', '25')
      handleChange('scoreCategory', 'LOW')
    } else if (value === 'MEDIUM') {
      handleChange('minScore', '26')
      handleChange('maxScore', '75')
      handleChange('scoreCategory', 'MEDIUM')
    } else if (value === 'HIGH') {
      handleChange('minScore', '76')
      handleChange('maxScore', '100')
      handleChange('scoreCategory', 'HIGH')
    } else {
      handleChange('minScore', '')
      handleChange('maxScore', '')
      handleChange('scoreCategory', '')
    }
  }

  const hasActiveFilters = 
    (filters.patientId && filters.patientId.trim()) || 
    filters.gender || 
    (filters.diagnosis && filters.diagnosis.trim()) || 
    (filters.minScore && filters.minScore.trim()) || 
    (filters.maxScore && filters.maxScore.trim()) || 
    filters.startDate || 
    filters.endDate ||
    filters.scoreCategory

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <IconFilter />
          Filters
          {hasActiveFilters && <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 text-xs">●</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto" align="end" side="bottom" sideOffset={8}>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium leading-none mb-1">Filter Claims</h4>
            <p className="text-sm text-muted-foreground">Filter claims by various criteria</p>
          </div>
          <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              value={filters.patientId}
              onChange={(e) => handleChange('patientId', e.target.value)}
              placeholder="Search by patient ID"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={filters.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              placeholder="Search by diagnosis"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={filters.gender || undefined} onValueChange={(v) => handleChange('gender', v === 'all' ? '' : v)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="All genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genders</SelectItem>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scoreCategory">Risk Category</Label>
            <Select value={filters.scoreCategory || undefined} onValueChange={(v) => handleScoreCategoryChange(v === 'all' ? '' : v)}>
              <SelectTrigger id="scoreCategory">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="LOW">Low (0-25)</SelectItem>
                <SelectItem value="MEDIUM">Medium (26-75)</SelectItem>
                <SelectItem value="HIGH">High (76-100)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="minScore">Min Score</Label>
              <Input
                id="minScore"
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => handleChange('minScore', e.target.value)}
                placeholder="0"
                disabled={!!filters.scoreCategory}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxScore">Max Score</Label>
              <Input
                id="maxScore"
                type="number"
                min="0"
                max="100"
                value={filters.maxScore}
                onChange={(e) => handleChange('maxScore', e.target.value)}
                placeholder="100"
                disabled={!!filters.scoreCategory}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClear} className="flex-1">Clear All</Button>
            <Button onClick={() => setOpen(false)} className="flex-1">Apply</Button>
          </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

