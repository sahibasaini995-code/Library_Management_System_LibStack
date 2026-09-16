import { format, parseISO, isValid, differenceInDays, addDays } from "date-fns"

export function formatDate(dateString: string | null, formatStr = "MMM dd, yyyy"): string {
  if (!dateString) return "N/A"

  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return "Invalid Date"
    return format(date, formatStr)
  } catch {
    return "Invalid Date"
  }
}

export function getDaysUntilDue(expectedReturnDate: string | null): number | null {
  if (!expectedReturnDate) return null

  try {
    const dueDate = parseISO(expectedReturnDate)
    if (!isValid(dueDate)) return null

    const today = new Date()
    return differenceInDays(dueDate, today)
  } catch {
    return null
  }
}

export function isOverdue(expectedReturnDate: string | null): boolean {
  const daysUntilDue = getDaysUntilDue(expectedReturnDate)
  return daysUntilDue !== null && daysUntilDue < 0
}

export function getDefaultReturnDate(daysFromNow = 14): string {
  return format(addDays(new Date(), daysFromNow), "yyyy-MM-dd")
}

export function getDefaultIssueDate(): string {
  return format(new Date(), "yyyy-MM-dd")
}
