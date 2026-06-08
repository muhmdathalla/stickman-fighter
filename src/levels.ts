import { Stage } from './types';

export const INITIAL_STAGES: Stage[] = [
  {
    id: 1,
    name: '1. The Pencil Scratchpad',
    description: 'Learn the ropes on a simple flat drafting notebook. Defeat standard Charcoal Grunts.',
    baseReward: 100,
    completed: false,
    platforms: [
      { id: 'floor-1', x: -500, y: 500, w: 2500, h: 100, type: 'floor' }
    ],
    waveConfig: [
      { enemyTypes: ['grunt'], spawnInterval: 3000, count: 4 }
    ]
  },
  {
    id: 2,
    name: '2. Ledger Ledges',
    description: 'Jump across elevated draft ledger lines. Watch your step, and deal with nimble Speedsters.',
    baseReward: 150,
    completed: false,
    platforms: [
      { id: 'floor-2', x: -500, y: 500, w: 3000, h: 100, type: 'floor' },
      { id: 'p2-1', x: 200, y: 380, w: 250, h: 18, type: 'platform' },
      { id: 'p2-2', x: 600, y: 300, w: 250, h: 18, type: 'platform' },
      { id: 'p2-3', x: 1000, y: 380, w: 250, h: 18, type: 'platform' },
    ],
    waveConfig: [
      { enemyTypes: ['grunt', 'speedster'], spawnInterval: 2500, count: 6 }
    ]
  },
  {
    id: 3,
    name: '3. Toxic Ink Pit',
    description: 'Scribbled dangerous spikes line the gaps in this workbook page. Stand clear!',
    baseReward: 200,
    completed: false,
    platforms: [
      { id: 'p3-f1', x: -500, y: 500, w: 800, h: 100, type: 'floor' },
      { id: 'p3-hazard', x: 300, y: 485, w: 400, h: 40, type: 'hazard' }, // Spikes
      { id: 'p3-f2', x: 700, y: 500, w: 1000, h: 100, type: 'floor' },
      { id: 'p3-plat1', x: 250, y: 350, w: 180, h: 18, type: 'platform' },
      { id: 'p3-plat2', x: 490, y: 350, w: 180, h: 18, type: 'platform' },
    ],
    waveConfig: [
      { enemyTypes: ['grunt', 'grunt', 'speedster'], spawnInterval: 2500, count: 8 }
    ]
  },
  {
    id: 4,
    name: '4. Graph Grid Climb',
    description: 'High vertical bouncers let you leap to outstanding heights. Watch out for enemy Archers shooting arrows!',
    baseReward: 250,
    completed: false,
    platforms: [
      { id: 'p4-f', x: -500, y: 500, w: 2500, h: 100, type: 'floor' },
      { id: 'p4-bounce1', x: 300, y: 480, w: 80, h: 20, type: 'trampoline' }, // Emerald Trampolines!
      { id: 'p4-bounce2', x: 1100, y: 480, w: 80, h: 20, type: 'trampoline' },
      { id: 'p4-p1', x: 200, y: 320, w: 280, h: 18, type: 'platform' },
      { id: 'p4-p2', x: 600, y: 220, w: 300, h: 18, type: 'platform' },
      { id: 'p4-p3', x: 1000, y: 320, w: 280, h: 18, type: 'platform' },
    ],
    waveConfig: [
      { enemyTypes: ['grunt', 'archer', 'archer'], spawnInterval: 3000, count: 8 }
    ]
  },
  {
    id: 5,
    name: '5. The Crimson Margin Line',
    description: 'A very narrow ledger bridge lined with hazards. Shield Enforcers make their debut here.',
    baseReward: 300,
    completed: false,
    platforms: [
      { id: 'p5-f1', x: -500, y: 540, w: 500, h: 100, type: 'floor' },
      { id: 'p5-hazard1', x: 0, y: 520, w: 900, h: 40, type: 'hazard' }, // Spikes beneath
      { id: 'p5-bridge', x: 50, y: 340, w: 800, h: 18, type: 'platform' }, // High narrow wooden platform
      { id: 'p5-f2', x: 950, y: 540, w: 1000, h: 100, type: 'floor' },
    ],
    waveConfig: [
      { enemyTypes: ['grunt', 'shield', 'speedster'], spawnInterval: 2800, count: 9 }
    ]
  },
  {
    id: 6,
    name: '6. Eraser Blockade',
    description: 'Yellow Eraser planks move left-to-right! Try to keep your footing from sliding off into spike pits.',
    baseReward: 350,
    completed: false,
    platforms: [
      { id: 'p6-f1', x: -500, y: 500, w: 500, h: 100, type: 'floor' },
      { id: 'p6-haz', x: 0, y: 485, w: 800, h: 40, type: 'hazard' },
      { id: 'p6-f2', x: 800, y: 500, w: 1000, h: 100, type: 'floor' },
      // Moving Erasers
      { id: 'p6-eraser1', x: 100, y: 350, w: 160, h: 25, type: 'eraser', vx: 2, leftLimit: 60, rightLimit: 380 },
      { id: 'p6-eraser2', x: 500, y: 350, w: 160, h: 25, type: 'eraser', vx: -2, leftLimit: 420, rightLimit: 740 },
    ],
    waveConfig: [
      { enemyTypes: ['speedster', 'shield', 'archer'], spawnInterval: 2500, count: 10 }
    ]
  },
  {
    id: 7,
    name: '7. Giant Margin Citadel',
    description: 'Elite layout featuring all major enemies. Keep sharp, jump, backstab shields, and survive waves.',
    baseReward: 400,
    completed: false,
    platforms: [
      { id: 'p7-f', x: -500, y: 500, w: 2500, h: 100, type: 'floor' },
      { id: 'p7-p1', x: 100, y: 360, w: 250, h: 18, type: 'platform' },
      { id: 'p7-p2', x: 500, y: 240, w: 300, h: 18, type: 'platform' },
      { id: 'p7-p3', x: 950, y: 360, w: 250, h: 18, type: 'platform' },
      { id: 'p7-bounce', x: 440, y: 480, w: 60, h: 20, type: 'trampoline' },
      { id: 'p7-hazard1', x: 150, y: 485, w: 150, h: 40, type: 'hazard' },
      { id: 'p7-hazard2', x: 700, y: 485, w: 150, h: 40, type: 'hazard' },
    ],
    waveConfig: [
      { enemyTypes: ['grunt', 'speedster', 'shield', 'archer'], spawnInterval: 2200, count: 12 }
    ]
  },
  {
    id: 8,
    name: '8. The Final Canvas: Ink Overlord',
    description: 'Face the towering Ink Overlord! He stamps the floor, throws giant charcoal arrows, and spawns ink grunts.',
    baseReward: 1000,
    completed: false,
    platforms: [
      { id: 'p8-f', x: -500, y: 500, w: 2500, h: 100, type: 'floor' },
      { id: 'p8-plat1', x: 200, y: 320, w: 300, h: 18, type: 'platform' },
      { id: 'p8-plat2', x: 1000, y: 320, w: 300, h: 18, type: 'platform' },
    ],
    waveConfig: [
      // Wave 1: The giant Boss itself!
      { enemyTypes: ['boss'], spawnInterval: 1000, count: 1 }
    ]
  }
];
