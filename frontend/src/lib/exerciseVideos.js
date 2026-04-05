/**
 * Exercise video library data
 * Videos are curated YouTube embeds — no API key required.
 * Structure: { id, name, muscleGroups[], difficulty, equipment[], youtubeId, tips[], mistakes[] }
 */

export const EXERCISES = [
  {
    id: 'pushup',
    name: 'Push-Up',
    emoji: '💪',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders', 'Core'],
    difficulty: 'Beginner',
    equipment: ['None'],
    youtubeId: 'IODxDxX7oi4',
    description: 'The classic upper-body compound movement. Builds chest, triceps, and core strength with zero equipment.',
    tips: [
      'Keep elbows at ~45° angle, not flared wide',
      'Maintain a straight line from head to heels',
      'Lower chest to just above the floor for full range of motion',
      'Breathe in on the way down, exhale on the way up',
    ],
    mistakes: [
      'Sagging hips — keep core braced throughout',
      'Locking elbows at the top — maintain slight tension',
      'Looking up instead of neutral neck position',
    ],
  },
  {
    id: 'squat',
    name: 'Squat',
    emoji: '🏋️',
    muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Core'],
    difficulty: 'Beginner',
    equipment: ['None', 'Barbell'],
    youtubeId: 'aclHkVaku9U',
    description: 'The king of lower-body exercises. Targets quads, hamstrings, and glutes for total leg development.',
    tips: [
      'Keep knees tracking over toes',
      'Hip crease should drop below your knee at the bottom',
      'Drive through your heels as you stand up',
      'Keep your chest tall and spine neutral',
    ],
    mistakes: [
      'Knees caving inward — push them out actively',
      'Not going deep enough — work on hip mobility',
      'Heels rising off the floor',
    ],
  },
  {
    id: 'bicep-curl',
    name: 'Bicep Curl',
    emoji: '💪',
    muscleGroups: ['Biceps', 'Forearms'],
    difficulty: 'Beginner',
    equipment: ['Dumbbells', 'Resistance Bands', 'Barbell'],
    youtubeId: 'ykJmrZ5v0Oo',
    description: 'The definitive bicep isolation exercise. Full range of motion curls for peak muscle development.',
    tips: [
      'Keep elbows pinned tightly to your sides',
      'Fully extend at the bottom for maximum stretch',
      'Squeeze hard at the top for full contraction',
      'Control the negative (lowering) portion',
    ],
    mistakes: [
      'Swinging your back to lift heavier weight',
      'Not fully extending at the bottom',
      'Moving elbows forward — keep them fixed',
    ],
  },
  {
    id: 'pullup',
    name: 'Pull-Up',
    emoji: '🏋️',
    muscleGroups: ['Lats', 'Biceps', 'Rear Deltoids', 'Core'],
    difficulty: 'Intermediate',
    equipment: ['Pull-up Bar'],
    youtubeId: 'eGo4IYlbE5g',
    description: 'One of the best upper-body pulling movements. Builds a wide back and strong arms.',
    tips: [
      'Start from a dead hang for full range of motion',
      'Pull until chin clears the bar',
      'Control the descent — don\'t drop suddenly',
      'Engage your lats by "pulling your elbows to your hips"',
    ],
    mistakes: [
      'Kipping / swinging momentum instead of strict form',
      'Not fully extending at the bottom',
      'Shrugging your shoulders — keep them packed down',
    ],
  },
  {
    id: 'plank',
    name: 'Plank',
    emoji: '🧘',
    muscleGroups: ['Core', 'Shoulders', 'Glutes'],
    difficulty: 'Beginner',
    equipment: ['None'],
    youtubeId: 'pSHjTRCQxIw',
    description: 'The ultimate isometric core exercise. Builds a solid foundation for every other lift.',
    tips: [
      'Hips should form a straight line with shoulders and heels',
      'Squeeze glutes and abs hard throughout',
      'Keep breathing — don\'t hold your breath',
      'Look at the floor, not forward',
    ],
    mistakes: [
      'Hips sagging toward the floor',
      'Hips raised too high in a pike position',
      'Head drooping below the spine line',
    ],
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    emoji: '⚡',
    muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Dumbbells'],
    youtubeId: 'op9kVnSso6Q',
    description: 'The most fundamental strength movement. Works more muscles than any other single exercise.',
    tips: [
      'Bar should stay in contact with your legs throughout',
      'Keep your back flat — no rounding at the lumbar',
      'Drive your hips forward at the top, don\'t hyperextend',
      'Engage your lats before pulling ("protect your armpits")',
    ],
    mistakes: [
      'Rounding the lower back — biggest injury risk',
      'Bar drifting away from your body',
      'Not engaging core before the lift',
    ],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    emoji: '🦵',
    muscleGroups: ['Quads', 'Glutes', 'Hamstrings', 'Balance'],
    difficulty: 'Beginner',
    equipment: ['None', 'Dumbbells'],
    youtubeId: 'QOVaHwm-Q6U',
    description: 'A unilateral lower-body staple for fixing muscle imbalances and building functional leg strength.',
    tips: [
      'Keep your front knee from going past your toes',
      'Back knee should nearly touch the floor',
      'Keep your torso upright — don\'t lean forward',
      'Drive through your front heel to stand up',
    ],
    mistakes: [
      'Front knee collapsing inward',
      'Taking too short a step — limits depth',
      'Leaning the torso too far forward',
    ],
  },
  {
    id: 'shoulder-press',
    name: 'Shoulder Press',
    emoji: '🏋️',
    muscleGroups: ['Shoulders', 'Triceps', 'Upper Chest'],
    difficulty: 'Intermediate',
    equipment: ['Dumbbells', 'Barbell'],
    youtubeId: 'qEwKCR5JCog',
    description: 'The primary overhead pressing movement for building strong, capped shoulders.',
    tips: [
      'Press in a straight line overhead, not in an arc',
      'Avoid arching your lower back excessively',
      'Keep wrists neutral and stacked over elbows',
      'Fully lock out at the top for maximum development',
    ],
    mistakes: [
      'Excessive lower-back arch — brace your core',
      'Flaring elbows too wide — keep them at 45°',
      'Pressing the bar forward instead of straight up',
    ],
  },
]

export const DIFFICULTY_COLORS = {
  Beginner: '#22c55e',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
}

export const MUSCLE_GROUP_OPTIONS = [
  'All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes',
]

export const EQUIPMENT_OPTIONS = [
  'All', 'None', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar',
]
