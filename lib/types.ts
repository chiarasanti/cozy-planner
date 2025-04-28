export interface Project {
  id: string
  name: string
  dueDate: Date
  totalHours: number
  remainingHours: number
  createdAt: Date
}

export interface Task {
  id: string
  projectId: string
  projectName: string
  projectDueDate: Date
  date: Date
  hours: number
}
