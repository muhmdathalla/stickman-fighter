export interface Vector {
  x: number;
  y: number;
}

export type WeaponType = 'fists' | 'sword' | 'hammer' | 'spear' | 'scythe';

export interface Weapon {
  id: WeaponType;
  name: string;
  damage: number;
  range: number;
  swingSpeed: number; // Duration of swing in ms
  knockback: number;
  cost: number;
  description: string;
  unlocked: boolean;
  color: string;
}

export type SpecialAbilityType = 'dash' | 'shield' | 'fireball' | 'groundslam';

export interface SpecialAbility {
  id: SpecialAbilityType;
  name: string;
  cooldown: number; // in milliseconds
  duration: number; // in milliseconds
  cost: number;
  unlocked: boolean;
  description: string;
  lastUsed: number; // timestamp
}

export type EnemyType = 'grunt' | 'speedster' | 'shield' | 'archer' | 'boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  maxHealth: number;
  health: number;
  damage: number;
  speed: number;
  isFacingLeft: boolean;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt' | 'dead';
  stateTimer: number;
  lastAttackTime: number;
  attackCooldown: number;
  stunDuration: number;
  // Skeletal simulation
  headYOffset: number;
  ragdollFrames: number;
  joints: Record<string, Vector>;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'floor' | 'platform' | 'hazard' | 'trampoline' | 'eraser';
  vx?: number; // For moving erasers/platforms
  leftLimit?: number;
  rightLimit?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number; // 0 to 1
  decay: number;
  type: 'ink' | 'spark' | 'pencil' | 'blur' | 'bubble' | 'text';
  text?: string;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fromPlayer: boolean;
  type: 'arrow' | 'inkball' | 'shockwave';
  life: number; // remaining updates
  angle?: number;
}

export interface PlayerStats {
  maxHealth: number;
  health: number;
  coins: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  // Upgrades purchased
  maxHealthLvl: number;
  speedLvl: number;
  attackLvl: number;
  abilityCooldownLvl: number;
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  baseReward: number;
  completed: boolean;
  platforms: Platform[];
  waveConfig: {
    enemyTypes: EnemyType[];
    spawnInterval: number;
    count: number;
  }[];
}

export interface GameSettings {
  soundEnabled: boolean;
  screenShake: boolean;
  sketchyStyle: boolean;
  showControlsOverlay: boolean;
}
