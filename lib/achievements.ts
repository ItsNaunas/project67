/**
 * Achievement system for tracking user milestones
 */

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  requirement: (stats: UserStats) => boolean
}

export interface UserStats {
  projectsCreated: number
  projectsCompleted: number
  regenerationsTotal: number
  hasWebsiteLive: boolean
  hasPurchased: boolean
}

export const achievements: Achievement[] = [
  {
    id: 'first_project',
    title: 'First Step',
    description: 'Created your first project',
    icon: '🎯',
    requirement: (stats) => stats.projectsCreated >= 1,
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Completed all 3 sections of a project',
    icon: '🏆',
    requirement: (stats) => stats.projectsCompleted >= 1,
  },
  {
    id: 'publisher',
    title: 'Publisher',
    description: 'Generated and launched a website',
    icon: '🚀',
    requirement: (stats) => stats.hasWebsiteLive,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Regenerated content 10+ times',
    icon: '✨',
    requirement: (stats) => stats.regenerationsTotal >= 10,
  },
  {
    id: 'premium_member',
    title: 'Premium Member',
    description: 'Unlocked full access',
    icon: '👑',
    requirement: (stats) => stats.hasPurchased,
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Created 3+ projects',
    icon: '💼',
    requirement: (stats) => stats.projectsCreated >= 3,
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'Completed 5+ projects',
    icon: '⚡',
    requirement: (stats) => stats.projectsCompleted >= 5,
  },
]

export function checkAchievements(stats: UserStats): Achievement[] {
  return achievements.filter(achievement => achievement.requirement(stats))
}

export function getNewAchievements(
  previousStats: UserStats,
  currentStats: UserStats
): Achievement[] {
  const previousUnlocked = new Set(
    checkAchievements(previousStats).map(a => a.id)
  )
  const currentUnlocked = checkAchievements(currentStats)
  
  return currentUnlocked.filter(a => !previousUnlocked.has(a.id))
}

