import { motion } from 'framer-motion'
import Card from './ui/Card'
import { Achievement, checkAchievements, UserStats } from '@/lib/achievements'
import { Trophy, Lock } from 'lucide-react'

interface AchievementsProps {
  stats: UserStats
  compact?: boolean
}

export default function Achievements({ stats, compact = false }: AchievementsProps) {
  const unlockedAchievements = checkAchievements(stats)
  const { achievements } = require('@/lib/achievements')
  
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id))
  const progress = (unlockedAchievements.length / achievements.length) * 100

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="text-accentAlt" size={20} />
            <h3 className="font-semibold">Achievements</h3>
          </div>
          <div className="text-sm text-gray-400">
            {unlockedAchievements.length} / {achievements.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
          <motion.div
            className="bg-gradient-to-r from-accentAlt to-accent h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Achievement badges - compact view */}
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement: Achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id)
            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: isUnlocked ? 1.1 : 1 }}
                className={`relative w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all ${
                  isUnlocked
                    ? 'border-accentAlt bg-accentAlt/20'
                    : 'border-white/10 bg-white/5 grayscale opacity-50'
                }`}
                title={isUnlocked ? achievement.title : '???'}
              >
                <span className="text-2xl">{isUnlocked ? achievement.icon : <Lock size={20} />}</span>
              </motion.div>
            )
          })}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-accentAlt" />
            Achievements
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {unlockedAchievements.length} of {achievements.length} unlocked
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gradient">
            {Math.round(progress)}%
          </div>
          <p className="text-xs text-gray-400">Complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-3 mb-6">
        <motion.div
          className="bg-gradient-to-r from-accentAlt to-accent h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Achievement grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement: Achievement, index: number) => {
          const isUnlocked = unlockedIds.has(achievement.id)
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                isUnlocked
                  ? 'border-accentAlt bg-accentAlt/10 glow-gold'
                  : 'border-white/10 bg-white/5 grayscale opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-4xl ${!isUnlocked && 'opacity-30'}`}>
                  {isUnlocked ? achievement.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-1">
                    {isUnlocked ? achievement.title : '???'}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {isUnlocked ? achievement.description : 'Locked achievement'}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

