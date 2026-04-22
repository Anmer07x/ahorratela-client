export const parseLocalDate = (isoString?: string): Date | null => {
  if (!isoString) return null
  
  try {
    // Treat 'YYYY-MM-DD' as local noon to avoid timezone shifts in any OS/Browser
    const [year, month, day] = isoString.split('T')[0].split('-').map(Number)
    const date = new Date(year, month - 1, day, 12, 0, 0)
    
    // Check if it's a valid date
    return isNaN(date.getTime()) ? null : date
  } catch (err) {
    console.error('Error parsing local date:', err)
    return null
  }
}
