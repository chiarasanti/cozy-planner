import { v4 as uuidv4 } from "uuid"
import { addDays, differenceInBusinessDays, isWeekend, isBefore, startOfDay } from "date-fns"
import type { Project, Task } from "./types"

export function calculateDailyTasks(projects: Project[]): Task[] {
  const today = startOfDay(new Date())
  const allTasks: Task[] = []

  // Sort projects by due date (earliest first)
  const sortedProjects = [...projects].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  // Create a map of dates to available hours
  const dateHoursMap = new Map<string, number>()

  // For each project, calculate how to distribute the hours
  sortedProjects.forEach((project) => {
    if (project.remainingHours <= 0) return

    // Calculate business days between today and due date (inclusive)
    const daysLeft = differenceInBusinessDays(project.dueDate, today) + 1
    if (daysLeft <= 0) return // Project is due today or overdue

    // Calculate hours per day (minimum 2 hours per day)
    let hoursPerDay = Math.max(2, Math.ceil(project.remainingHours / daysLeft))

    // If hours per day * days left > remaining hours, adjust
    if (hoursPerDay * daysLeft > project.remainingHours) {
      // Try to distribute evenly
      hoursPerDay = Math.ceil(project.remainingHours / daysLeft)
    }

    let remainingHours = project.remainingHours
    let currentDate = new Date(today)

    // Distribute hours across days
    while (remainingHours > 0 && !isBefore(project.dueDate, currentDate)) {
      // Skip weekends
      if (isWeekend(currentDate)) {
        currentDate = addDays(currentDate, 1)
        continue
      }

      const dateKey = currentDate.toISOString().split("T")[0]
      const currentAvailableHours = dateHoursMap.get(dateKey) || 8 // Assume 8-hour workday

      // If we have hours available on this day
      if (currentAvailableHours > 0) {
        // Calculate hours to allocate today (minimum 2, or remaining if less than 2)
        const hoursToAllocate = Math.min(remainingHours < 2 ? remainingHours : hoursPerDay, currentAvailableHours)

        if (hoursToAllocate >= 2 || remainingHours < 2) {
          // Create a task for this day
          allTasks.push({
            id: uuidv4(),
            projectId: project.id,
            projectName: project.name,
            projectDueDate: project.dueDate,
            date: new Date(currentDate),
            hours: hoursToAllocate,
          })

          // Update remaining hours
          remainingHours -= hoursToAllocate

          // Update available hours for this day
          dateHoursMap.set(dateKey, currentAvailableHours - hoursToAllocate)
        }
      }

      // Move to next day
      currentDate = addDays(currentDate, 1)
    }
  })

  return allTasks
}
