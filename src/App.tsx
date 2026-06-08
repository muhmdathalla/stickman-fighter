import { useEffect, useRef, useState } from 'react';
import {
  Weapon,
  SpecialAbility,
  PlayerStats,
  Enemy,
  Projectile,
  Particle,
  Platform,
  Stage,
  WeaponType,
  SpecialAbilityType
} from './types';
import { INITIAL_STAGES } from './levels';
import { GameUI } from './components/GameUI';
import {
  initAudio,
  playJump,
  playLand,
  playSwoosh,
  playHit,
  playHurt,
  playDash,
  playShield,
  playGroundSlam,
  playInkBallLaunch,
  playExplosion,
  playCoin,
  playLevelWin,
  playLevelFail,
  setSoundEnabled
} from './sound';
import {
  drawPaperBackground,
  drawPlatform,
  drawProjectile,
  drawParticle,
  drawStickman,
  drawSketchCircle
} from './combat';

// Core physical configuration parameters
const GRAVITY = 0.55;
const FRICTION = 0.86;
const FLOOR_Y = 500;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Layout sizing
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [isMobile, setIsMobile] = useState(false);

  // Core level and configuration states
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [currentStageId, setCurrentStageId] = useState(1);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'victory' | 'gameover' | 'shopper'>('start');
  const [soundEnabled, setSoundEnabledState] = useState(true);

  // Upgradable items and capabilities
  const [weapons, setWeapons] = useState<Weapon[]>([
    { id: 'fists', name: 'Charcoal Fists', damage: 12, range: 45, swingSpeed: 120, knockback: 4, cost: 0, unlocked: true, color: '#4b5563', description: 'Raw dual crayon punches. Extremely fast, but short distance.' },
    { id: 'sword', name: 'Draftsman Sword', damage: 24, range: 75, swingSpeed: 200, knockback: 8, cost: 150, unlocked: false, color: '#3b82f6', description: 'A sharp, dual-edged writing blade. Ideal balanced choice.' },
    { id: 'hammer', name: 'Graph Hammer', damage: 55, range: 90, swingSpeed: 420, knockback: 22, cost: 350, unlocked: false, color: '#ca8a04', description: 'Massive brick ruler. Extremely heavy, causing devastating knockback!' },
    { id: 'spear', name: 'Pen Nib Spear', damage: 32, range: 110, swingSpeed: 240, knockback: 6, cost: 280, unlocked: false, color: '#10b981', description: 'Vibrant long-distance metal nib. Quick forward thrust piercing.' },
    { id: 'scythe', name: 'Scythe of Ink', damage: 45, range: 100, swingSpeed: 300, knockback: 10, cost: 450, unlocked: false, color: '#a855f7', description: 'Vampiric dark blade. Smites large arcs, draining 3 HP on critical hits.' }
  ]);

  const [activeWeaponId, setActiveWeaponId] = useState<WeaponType>('fists');

  const [abilities, setAbilities] = useState<SpecialAbility[]>([
    { id: 'dash', name: 'Sketch Blur', cooldown: 1200, duration: 180, cost: 0, unlocked: true, description: 'Surge quickly through space, gaining brief invincibility.', lastUsed: 0 },
    { id: 'shield', name: 'Ink Protection', cooldown: 6060, duration: 2500, cost: 150, unlocked: false, description: 'Erect an ink forcefield that deflects attacks and projectiles.', lastUsed: 0 },
    { id: 'fireball', name: 'Ink splatter', cooldown: 3000, duration: 0, cost: 250, unlocked: false, description: 'Spit a chaotic capsule of wet ink that explodes on contact.', lastUsed: 0 },
    { id: 'groundslam', name: 'Grid Slam', cooldown: 7000, duration: 0, cost: 380, unlocked: false, description: 'Slam the paper from midair, initiating left/right shockwaves.', lastUsed: 0 }
  ]);

  // Player RPG attribute Stats
  const [stats, setStats] = useState<PlayerStats>({
    maxHealth: 100,
    health: 100,
    coins: 40,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    maxHealthLvl: 0,
    speedLvl: 0,
    attackLvl: 0,
    abilityCooldownLvl: 0
  });

  // Dynamic entities refs for 60fps tick loops without React delays
  const playerRef = useRef({
    x: 100,
    y: FLOOR_Y,
    vx: 0,
    vy: 0,
    isFacingLeft: false,
    isJumping: false,
    isHurt: false,
    hurtTimer: 0,
    animProgress: 0,
    aimAngle: 0,
    // Attacking details
    attackProgress: 0,
    swordAngle: 0,
    isAttacking: false,
    attackTime: 0,
    // Active skill buffers
    dashTimer: 0,
    dashDir: 1,
    shieldTimer: 0,
    isSlamming: false
  });

  // Camera scroll coordinates
  const cameraXRef = useRef(0);

  // Entities catalogs
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const platformsRef = useRef<Platform[]>([]);

  // Keyboard controls status
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const mousePosRef = useRef({ x: 400, y: 300 });

  // Mobile virtual joystick coordinates
  const [touchActive, setTouchActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 }); // -1 to 1 values

  // Spawner triggers
  const waveActiveRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const spawnedCountRef = useRef(0);
  const totalWaveEnemiesRef = useRef(0);
  const nextWaveSpawnTimeRef = useRef(0);

  // Setup sound on startup
  const toggleSound = () => {
    initAudio();
    const nextVal = !soundEnabled;
    setSoundEnabledState(nextVal);
    setSoundEnabled(nextVal);
  };

  // Sizing adjustor
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWindowSize({ width: w, height: h });
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manage Keyboard input binds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      initAudio(); // resume AudioContext upon first button tap safely
      const code = e.code;
      keysPressedRef.current[code] = true;

      if (gameState !== 'playing') return;

      // Handle Instant Skill Cast keys
      if (code === 'ShiftLeft' || code === 'KeyQ') castAbility('dash');
      if (code === 'KeyE' || code === 'KeyC') castAbility('shield');
      if (code === 'KeyF' || code === 'KeyR') castAbility('fireball');
      if (code === 'KeyV' || code === 'KeyG') castAbility('groundslam');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, abilities, stats]);

  // Canvas Mouse movement bindings
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || gameState !== 'playing') return;
      const rect = canvasRef.current.getBoundingClientRect();
      // Store local canvas mouse positions
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mousePosRef.current = { x: mx, y: my };
    };

    const handleMouseDown = () => {
      initAudio();
      if (gameState !== 'playing') return;
      triggerMeleeAttack();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState, activeWeaponId, stats]);

  // Trigger Melee slice
  const triggerMeleeAttack = () => {
    const player = playerRef.current;
    if (player.isAttacking || player.dashTimer > 0) return;

    const wpn = weapons.find((w) => w.id === activeWeaponId) || weapons[0];
    playSwoosh(wpn.id);

    player.isAttacking = true;
    player.attackProgress = 0;
    player.attackTime = wpn.swingSpeed;
  };

  // Cast special activated abilities
  const castAbility = (id: SpecialAbilityType) => {
    const abiIndex = abilities.findIndex((a) => a.id === id);
    if (abiIndex === -1) return;
    const abi = abilities[abiIndex];
    if (!abi.unlocked) return;

    const now = Date.now();
    // Check level upgrade cooldown reduction
    const cooldownReduction = stats.abilityCooldownLvl * 0.05; // 5% reduction per level, max 50%
    const realCooldown = abi.cooldown * (1 - Math.min(0.5, cooldownReduction));

    if (now - abi.lastUsed < realCooldown) return;

    const player = playerRef.current;

    // Apply ability logic
    if (id === 'dash') {
      playDash();
      player.dashTimer = abi.duration / 16.6; // ~180ms
      player.dashDir = player.isFacingLeft ? -1 : 1;
      player.vx = player.dashDir * (15 + stats.speedLvl * 0.5);
      player.vy = 0; // lock vertical
      // emit blur clouds
      spawnParticles(player.x, player.y - 15, 6, 'blur', 'rgba(59, 130, 246, 0.4)');
    } else if (id === 'shield') {
      playShield();
      player.shieldTimer = abi.duration / 16.6;
      spawnParticles(player.x, player.y - 15, 8, 'spark', 'rgba(16, 185, 129, 0.8)');
    } else if (id === 'fireball') {
      playInkBallLaunch();
      const angle = player.aimAngle;
      const speed = 11;
      // Launch projectile directly to cursor orientation
      const projId = 'splat-' + Math.random().toString();
      projectilesRef.current.push({
        id: projId,
        x: player.x,
        y: player.y - 25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 12,
        damage: 35 + stats.attackLvl * 4,
        fromPlayer: true,
        type: 'inkball',
        life: 180
      });
    } else if (id === 'groundslam') {
      if (player.y < FLOOR_Y - 20) {
        playGroundSlam();
        player.isSlamming = true;
        player.vy = 18; // rapid drop down
        player.vx = 0;
      } else {
        // Must be in air, or auto-jump and slam!
        player.vy = -6;
        player.isSlamming = true;
        setTimeout(() => {
          player.vy = 20;
        }, 120);
      }
    }

    // Reset cooldown
    const updated = [...abilities];
    updated[abiIndex] = { ...abi, lastUsed: now };
    setAbilities(updated);
  };

  // Spawns multiple physical sketch particles
  const spawnParticles = (x: number, y: number, count: number, type: 'ink' | 'spark' | 'pencil' | 'blur' | 'bubble', color: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'ink' ? 2 : 0),
        size: Math.random() * 4 + (type === 'ink' ? 3 : 1.5),
        color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02,
        type
      });
    }
  };

  // Numeric damage and coins popups
  const spawnTextParticle = (x: number, y: number, text: string, color: string) => {
    particlesRef.current.push({
      x,
      y: y - 10,
      vx: (Math.random() * 1.5 - 0.75),
      vy: -1.8 - Math.random() * 1.5,
      size: 13,
      color,
      life: 1.0,
      decay: 0.02,
      type: 'text',
      text
    });
  };

  // Launch a stage and configure platforms, wave stats
  const selectStageAndReset = (stageId: number) => {
    const stage = stages.find((s) => s.id === stageId) || stages[0];
    setCurrentStageId(stageId);

    // Set entities
    platformsRef.current = stage.platforms;
    enemiesRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];

    // Reset Player coordinates
    const player = playerRef.current;
    player.x = 100;
    player.y = FLOOR_Y;
    player.vx = 0;
    player.vy = 0;
    player.isAttacking = false;
    player.dashTimer = 0;
    player.shieldTimer = 0;
    player.isSlamming = false;

    // Reset stats health
    setStats((prev) => ({
      ...prev,
      health: prev.maxHealth
    }));

    cameraXRef.current = 0;

    // Build Wave progress
    waveActiveRef.current = true;
    spawnedCountRef.current = 0;
    spawnTimerRef.current = 0;
    
    // Wave configuration: count total enemies
    let total = 0;
    stage.waveConfig.forEach((w) => {
      total += w.count;
    });
    totalWaveEnemiesRef.current = total;
    nextWaveSpawnTimeRef.current = Date.now();

    setGameState('playing');
  };

  const startCurrentStage = () => {
    selectStageAndReset(currentStageId);
  };

  // Triggered when upgrading active stats in the Shop
  const handleUpgradeStat = (type: 'health' | 'speed' | 'damage' | 'cooldown') => {
    if (type === 'health') {
      const cost = (stats.maxHealthLvl + 1) * 75;
      if (stats.coins >= cost && stats.maxHealthLvl < 10) {
        playCoin();
        setStats((prev) => {
          const nextLvl = prev.maxHealthLvl + 1;
          const nextMax = 100 + nextLvl * 20;
          return {
            ...prev,
            maxHealthLvl: nextLvl,
            maxHealth: nextMax,
            health: nextMax,
            coins: prev.coins - cost
          };
        });
      }
    } else if (type === 'speed') {
      const cost = (stats.speedLvl + 1) * 100;
      if (stats.coins >= cost && stats.speedLvl < 10) {
        playCoin();
        setStats((prev) => ({
          ...prev,
          speedLvl: prev.speedLvl + 1,
          coins: prev.coins - cost
        }));
      }
    } else if (type === 'damage') {
      const cost = (stats.attackLvl + 1) * 120;
      if (stats.coins >= cost && stats.attackLvl < 10) {
        playCoin();
        setStats((prev) => ({
          ...prev,
          attackLvl: prev.attackLvl + 1,
          coins: prev.coins - cost
        }));
      }
    } else if (type === 'cooldown') {
      const cost = (stats.abilityCooldownLvl + 1) * 150;
      if (stats.coins >= cost && stats.abilityCooldownLvl < 10) {
        playCoin();
        setStats((prev) => ({
          ...prev,
          abilityCooldownLvl: prev.abilityCooldownLvl + 1,
          coins: prev.coins - cost
        }));
      }
    }
  };

  // Buy melee weapon
  const handleBuyWeapon = (id: WeaponType) => {
    const wpnIndex = weapons.findIndex((w) => w.id === id);
    if (wpnIndex === -1) return;
    const w = weapons[wpnIndex];

    if (!w.unlocked && stats.coins >= w.cost) {
      playCoin();
      const updated = [...weapons];
      updated[wpnIndex] = { ...w, unlocked: true };
      setWeapons(updated);
      setActiveWeaponId(id);
      setStats((prev) => ({ ...prev, coins: prev.coins - w.cost }));
    }
  };

  // Unlock abilities
  const handleBuyAbility = (id: SpecialAbilityType) => {
    const index = abilities.findIndex((a) => a.id === id);
    if (index === -1) return;
    const a = abilities[index];

    if (!a.unlocked && stats.coins >= a.cost) {
      playCoin();
      const updated = [...abilities];
      updated[index] = { ...a, unlocked: true };
      setAbilities(updated);
      setStats((prev) => ({ ...prev, coins: prev.coins - a.cost }));
    }
  };

  // Main high-precision physics frame ticking (runs inside requestAnimationFrame)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (gameState === 'playing') {
        updatePhysics();
        drawScene();
      }
      animId = requestAnimationFrame(tick);
    };

    // Frame mechanics update
    const updatePhysics = () => {
      const player = playerRef.current;
      const keys = keysPressedRef.current;

      // 1. Spawning Enemies Wave Coordinator
      const stage = stages.find((s) => s.id === currentStageId) || stages[0];
      const nowTime = Date.now();

      if (waveActiveRef.current && spawnedCountRef.current < totalWaveEnemiesRef.current) {
        const currentWaveDef = stage.waveConfig[0]; // Simple single consolidated progressive wave config
        
        if (nowTime >= nextWaveSpawnTimeRef.current && enemiesRef.current.length < 5) {
          // Time to spawn!
          const typeToSpawn = currentWaveDef.enemyTypes[spawnedCountRef.current % currentWaveDef.enemyTypes.length];
          // Spawn coordinate outside player screen
          const side = Math.random() > 0.5 ? 1 : -1;
          const sx = player.x + side * (380 + Math.random() * 150);
          const sy = FLOOR_Y - 40;

          // Set specific health stats per enemy type
          let enemyMaxHealth = 30 + stage.id * 10;
          let enemyDmg = 5 + stage.id * 2;
          let enemyVelocity = 1.3 + Math.random() * 0.7;

          if (typeToSpawn === 'speedster') {
            enemyMaxHealth = 22 + stage.id * 8;
            enemyVelocity = 2.4 + Math.random() * 0.8;
          } else if (typeToSpawn === 'shield') {
            enemyMaxHealth = 60 + stage.id * 14;
            enemyVelocity = 0.8;
          } else if (typeToSpawn === 'archer') {
            enemyMaxHealth = 25 + stage.id * 7;
            enemyVelocity = 1.1;
          } else if (typeToSpawn === 'boss') {
            enemyMaxHealth = 400;
            enemyDmg = 20;
            enemyVelocity = 1.0;
          }

          enemiesRef.current.push({
            id: 'enemy-' + Math.random().toString(),
            type: typeToSpawn,
            x: sx,
            y: sy,
            vx: 0,
            vy: 0,
            width: typeToSpawn === 'boss' ? 50 : 20,
            height: typeToSpawn === 'boss' ? 100 : 40,
            maxHealth: enemyMaxHealth,
            health: enemyMaxHealth,
            damage: enemyDmg,
            speed: enemyVelocity,
            isFacingLeft: sx > player.x,
            state: 'idle',
            stateTimer: 0,
            lastAttackTime: 0,
            attackCooldown: typeToSpawn === 'archer' ? 1500 : 1000,
            stunDuration: 0,
            headYOffset: 0,
            ragdollFrames: 0,
            joints: {}
          });

          spawnedCountRef.current += 1;
          nextWaveSpawnTimeRef.current = nowTime + currentWaveDef.spawnInterval;
        }
      }

      // Check level win condition
      if (
        spawnedCountRef.current >= totalWaveEnemiesRef.current &&
        enemiesRef.current.length === 0 &&
        gameState === 'playing'
      ) {
        gameStateWinTrigger();
      }

      // 2. Player Controllers movement inputs
      if (player.dashTimer > 0) {
        player.dashTimer--;
        // Immune and extremely fast speed
        player.x += player.vx;
        // spawn dash blur particles
        if (Math.random() < 0.3) {
          particlesRef.current.push({
            x: player.x,
            y: player.y - 15,
            vx: -player.vx * 0.3,
            vy: Math.random() * 0.5 - 0.25,
            size: 8,
            color: 'rgba(59, 130, 246, 0.4)',
            life: 0.6,
            decay: 0.05,
            type: 'blur'
          });
        }
      } else {
        // Normal state controls
        let horizontalMove = 0;
        if (keys['KeyA'] || keys['ArrowLeft']) horizontalMove = -1;
        if (keys['KeyD'] || keys['ArrowRight']) horizontalMove = 1;

        // Apply mobile virtual joystick horizontal moves
        if (touchActive && Math.abs(joystickPos.x) > 0.1) {
          horizontalMove = joystickPos.x;
        }

        const runAcceleration = 0.85 + stats.speedLvl * 0.07;
        const maxRunningSpeed = 5.2 + stats.speedLvl * 0.35;

        player.vx += horizontalMove * runAcceleration;
        player.vx *= FRICTION;

        // Clamp run speed
        if (player.vx > maxRunningSpeed) player.vx = maxRunningSpeed;
        if (player.vx < -maxRunningSpeed) player.vx = -maxRunningSpeed;

        if (horizontalMove !== 0) {
          player.isFacingLeft = horizontalMove < 0;
          player.animProgress += 0.06;
          if (player.animProgress >= 1.0) player.animProgress = 0;
        } else {
          // decelerate animation smoothly
          player.animProgress = 0;
          player.vx *= 0.8;
        }

        // Jump mechanics
        const requestJump = keys['KeyW'] || keys['Space'] || keys['ArrowUp'];
        if (requestJump && !player.isJumping) {
          playJump();
          player.vy = -12.5; // Upward impulse
          player.isJumping = true;
          // Spawn little jump particles on floor
          spawnParticles(player.x, player.y, 4, 'pencil', '#9e9e9e');
        }

        player.vy += GRAVITY;
        player.y += player.vy;
        player.x += player.vx;

        // Keep player bounded on paper borders
        if (player.x < -600) {
          player.x = -600;
          player.vx = 0;
        }
        if (player.x > 3000) {
          player.x = 3000;
          player.vx = 0;
        }
      }

      // Slam ground logic
      if (player.isSlamming) {
        player.vy += GRAVITY * 1.5;
        // Search if hit floor or platform
        if (player.y >= FLOOR_Y) {
          player.y = FLOOR_Y;
          player.vy = 0;
          player.isJumping = false;
          player.isSlamming = false;
          executeGroundSlamSplash();
        } else {
          // Check collision with floating platforms
          platformsRef.current.forEach((plat) => {
            if (
              player.x >= plat.x &&
              player.x <= plat.x + plat.w &&
              player.y >= plat.y &&
              player.y <= plat.y + 15 &&
              player.vy > 0
            ) {
              player.y = plat.y;
              player.vy = 0;
              player.isJumping = false;
              player.isSlamming = false;
              executeGroundSlamSplash();
            }
          });
        }
      }

      // Check standing height vs Floor Y bounds
      if (player.y >= FLOOR_Y) {
        player.y = FLOOR_Y;
        if (player.vy > 0.5) {
          playLand();
        }
        player.vy = 0;
        player.isJumping = false;
      }

      // 3. Platform Solid collisions
      platformsRef.current.forEach((plat) => {
        // Handle moving platforms (Erasers)
        if (plat.type === 'eraser' && plat.vx !== undefined && plat.leftLimit !== undefined && plat.rightLimit !== undefined) {
          plat.x += plat.vx;
          if (plat.x > plat.rightLimit) {
            plat.vx = -Math.abs(plat.vx);
          } else if (plat.x < plat.leftLimit) {
            plat.vx = Math.abs(plat.vx);
          }
        }

        // Top line standing check
        if (
          player.x >= plat.x &&
          player.x <= plat.x + plat.w &&
          player.y + player.vy >= plat.y &&
          player.y - player.vy <= plat.y + 15
        ) {
          if (player.vy > 0) {
            player.y = plat.y;
            player.vy = 0;
            player.isJumping = false;

            // Handle special platform modifiers
            if (plat.type === 'trampoline') {
              playJump();
              player.vy = -18; // Massive bounce!
              player.isJumping = true;
              spawnParticles(player.x, player.y, 10, 'spark', '#10b981');
            } else if (plat.type === 'hazard') {
              // Spikes! Take heavy hazard spikes damage
              takePlayerDamage(14, 'SPIKES!');
              player.vy = -8; // Knocks player up!
              player.isJumping = true;
            } else if (plat.type === 'eraser' && plat.vx !== undefined) {
              // Translate player with the platform horizontal speed
              player.x += plat.vx;
            }
          }
        }
      });

      // 4. Melee attacks frame tracking
      if (player.isAttacking) {
        player.attackProgress += 16.6 / player.attackTime;
        
        // Calculate weapon swing angle
        const activeWpn = weapons.find((w) => w.id === activeWeaponId) || weapons[0];
        const initialAngle = player.aimAngle - Math.PI / 2.5;
        const targetAngle = player.aimAngle + Math.PI / 2.5;
        player.swordAngle = initialAngle + (targetAngle - initialAngle) * player.attackProgress;

        // Perform active damage checks on half-swing
        if (player.attackProgress >= 0.4 && player.attackProgress <= 0.6) {
          const range = activeWpn.range;
          const rawDamage = activeWpn.damage * (1 + stats.attackLvl * 0.15); // +15% per upgrade lvl

          enemiesRef.current.forEach((en) => {
            if (en.state === 'dead') return;
            const dx = en.x - player.x;
            const dy = en.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= range + 10) {
              // Ensure enemy is in weapon attack direction arc or facing direction
              const angleToEnemy = Math.atan2(dy, dx);
              const angleDifference = Math.abs(angleToEnemy - player.aimAngle);

              if (angleDifference < Math.PI / 1.8) {
                // Hit! Calculate shielding modifier
                let dealDmg = rawDamage;
                let isBlocked = false;

                if (en.type === 'shield' && en.isFacingLeft !== player.isFacingLeft) {
                  // Shield enforcer blocks with shield!
                  isBlocked = true;
                  dealDmg = Math.floor(rawDamage * 0.15); // block 85%
                }

                if (isBlocked) {
                  playHit(false);
                  spawnTextParticle(en.x, en.y - 40, 'BLOCKED!', '#6b7280');
                  spawnParticles(en.x, en.y - 15, 3, 'spark', '#9fa6b2');
                  // recoil player
                  player.vx = player.isFacingLeft ? 4 : -4;
                } else {
                  // Standard hit
                  playHit(en.type === 'boss');
                  en.health -= dealDmg;
                  en.vx = player.isFacingLeft ? -activeWpn.knockback : activeWpn.knockback;
                  en.vy = -activeWpn.knockback * 0.4;
                  en.stunDuration = 15; // stun for 15 frames
                  en.state = 'hurt';

                  // Vampire heal on Scythe
                  if (activeWpn.id === 'scythe') {
                    setStats((prev) => ({
                      ...prev,
                      health: Math.min(prev.maxHealth, prev.health + 2)
                    }));
                  }

                  spawnTextParticle(en.x, en.y - 40, `-${Math.round(dealDmg)}`, '#ef4444');
                  spawnParticles(en.x, en.y - 15, 6, 'ink', '#222222');
                }
              }
            }
          });
        }

        if (player.attackProgress >= 1.0) {
          player.isAttacking = false;
        }
      }

      // Update aim angle smoothly towards target mouse position
      const targetAimAngle = Math.atan2(
        mousePosRef.current.y - (player.y - 26),
        mousePosRef.current.x - (player.x - cameraXRef.current)
      );
      // spring rotation clamp
      player.aimAngle = targetAimAngle;

      // 5. Enemies physical simulation
      enemiesRef.current.forEach((en) => {
        if (en.health <= 0 && en.state !== 'dead') {
          en.state = 'dead';
          en.stateTimer = 50; // Dead frames outline
          playExplosion();
          // Spawn XP and dynamic coin payout
          const gainXp = Math.floor(40 * (currentStageId * 0.8));
          const gainCoins = Math.floor((en.type === 'boss' ? 250 : 15 + Math.random() * 12) * (currentStageId * 0.8));

          setStats((prev) => {
            let nextXp = prev.xp + gainXp;
            let nextLvl = prev.level;
            let reqXp = prev.nextLevelXp;

            if (nextXp >= reqXp) {
              nextXp -= reqXp;
              nextLvl += 1;
              reqXp = Math.floor(reqXp * 1.5);
              spawnTextParticle(player.x, player.y - 60, 'LEVEL UP!', '#3b82f6');
            }
            return {
              ...prev,
              xp: nextXp,
              level: nextLvl,
              nextLevelXp: reqXp,
              coins: prev.coins + gainCoins
            };
          });

          spawnTextParticle(en.x, en.y - 50, `+${gainCoins} c`, '#ca8a04');
          spawnParticles(en.x, en.y - 15, 12, 'ink', '#ca8a04');
          return;
        }

        if (en.state === 'dead') {
          en.y += 2; // sink down floor
          return;
        }

        // Physical gravity and platform collision for enemies
        en.vy += GRAVITY;
        en.y += en.vy;
        en.x += en.vx;
        en.vx *= FRICTION;

        if (en.y >= FLOOR_Y) {
          en.y = FLOOR_Y;
          en.vy = 0;
        }

        // Collision of enemies with solid platforms
        platformsRef.current.forEach((plat) => {
          if (
            en.x >= plat.x &&
            en.x <= plat.x + plat.w &&
            en.y + en.vy >= plat.y &&
            en.y - en.vy <= plat.y + 15
          ) {
            if (en.vy > 0) {
              en.y = plat.y;
              en.vy = 0;
              if (plat.type === 'eraser' && plat.vx !== undefined) {
                en.x += plat.vx;
              }
            }
          }
        });

        // AI Behaviors state engine
        if (en.stunDuration > 0) {
          en.stunDuration--;
          return;
        }

        const distToPlayer = Math.sqrt((en.x - player.x) * (en.x - player.x) + (en.y - player.y) * (en.y - player.y));
        en.isFacingLeft = en.x > player.x;

        // Boss Special Action Tick Selector
        if (en.type === 'boss') {
          en.state = 'chase';
          const bossAttackElapsed = nowTime - en.lastAttackTime;

          if (bossAttackElapsed > 2500 && distToPlayer < 400) {
            // Pick random attack
            const choice = Math.random();
            en.lastAttackTime = nowTime;

            if (choice < 0.35) {
              // Giant leap and floor slam stamp!
              en.vy = -16;
              en.vx = en.isFacingLeft ? -5 : 5;
              spawnTextParticle(en.x, en.y - 60, 'LEAP STAMP!', '#ea580c');
            } else if (choice < 0.7) {
              // Throw massive splash inkball
              playInkBallLaunch();
              const bAngle = Math.atan2(player.y - en.y, player.x - en.x);
              const bId = 'bossball-' + Math.random();
              projectilesRef.current.push({
                id: bId,
                x: en.x,
                y: en.y - 65,
                vx: Math.cos(bAngle) * 9,
                vy: Math.sin(bAngle) * 9,
                radius: 20,
                damage: 25,
                fromPlayer: false,
                type: 'inkball',
                life: 200
              });
              spawnTextParticle(en.x, en.y - 60, 'SPLAT THROW!', '#2563eb');
            } else {
              // Summon standard Grunt helpers!
              spawnTextParticle(en.x, en.y - 60, 'SUMMON REINFORCEMENTS!', '#9333ea');
              enemiesRef.current.push({
                id: 'summoned-' + Math.random(),
                type: 'grunt',
                x: en.x + (Math.random() > 0.5 ? 120 : -120),
                y: FLOOR_Y - 40,
                vx: 0,
                vy: 0,
                width: 20,
                height: 40,
                maxHealth: 25,
                health: 25,
                damage: 6,
                speed: 1.5,
                isFacingLeft: true,
                state: 'chase',
                stateTimer: 0,
                lastAttackTime: 0,
                attackCooldown: 1000,
                stunDuration: 0,
                headYOffset: 0,
                ragdollFrames: 0,
                joints: {}
              });
            }
          }

          // Direct stomp contact damage check
          if (distToPlayer < 75 && Math.abs(en.y - player.y) < 30) {
            takePlayerDamage(1.5, 'STOMPED');
          }

          en.x += en.isFacingLeft ? -en.speed : en.speed;
          return; // Skip standard AI checks
        }

        // Standard Grunts / speedster behaviors
        if (distToPlayer < 350) {
          en.state = 'chase';
          const dir = en.isFacingLeft ? -1 : 1;
          en.vx += dir * 0.25;
          const maxEnemySpd = en.type === 'speedster' ? en.speed * 1.5 : en.speed;
          
          if (en.vx > maxEnemySpd) en.vx = maxEnemySpd;
          if (en.vx < -maxEnemySpd) en.vx = -maxEnemySpd;

          // Perform melee strike check
          if (distToPlayer < 36 && nowTime - en.lastAttackTime > en.attackCooldown) {
            en.lastAttackTime = nowTime;
            takePlayerDamage(en.damage, 'SLICK STRIKE');
            // punch effect
            spawnParticles(player.x, player.y - 15, 3, 'spark', '#ef4444');
          }
        } else {
          // Idle patrol
          en.state = 'patrol';
          if (Math.random() < 0.01) {
            en.vx = (Math.random() * 2 - 1) * en.speed;
          }
        }

        // Archer logic: shoot arrow from far distance
        if (en.type === 'archer') {
          if (distToPlayer < 400 && distToPlayer > 180) {
            // Stay away!
            en.vx = en.isFacingLeft ? 0.3 : -0.3; // backoff slightly
            const arcElapsed = nowTime - en.lastAttackTime;
            
            if (arcElapsed > en.attackCooldown) {
              en.lastAttackTime = nowTime;
              // Shoot arrow inside straight line targeting player
              playInkBallLaunch();
              const pAngle = Math.atan2((player.y - 15) - en.y, player.x - en.x) + (Math.random() * 0.1 - 0.05);
              const pId = 'arrow-' + Math.random().toString();
              projectilesRef.current.push({
                id: pId,
                x: en.x,
                y: en.y - 18,
                vx: Math.cos(pAngle) * 9.5,
                vy: Math.sin(pAngle) * 9.5,
                radius: 4,
                damage: 15,
                fromPlayer: false,
                type: 'arrow',
                life: 180,
                angle: pAngle
              });
            }
          }
        }
      });

      // Clear dead enemies out
      enemiesRef.current = enemiesRef.current.filter((e) => e.state !== 'dead' || e.stateTimer-- > 0);

      // 6. Projectiles Flying math & collision
      projectilesRef.current.forEach((proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        // Shield protection bubble check
        const isShieldProtected = player.shieldTimer > 0;

        if (proj.fromPlayer) {
          // Player ink ball collision check vs enemies
          enemiesRef.current.forEach((en) => {
            if (en.state === 'dead') return;
            const pdx = en.x - proj.x;
            const pdy = en.y - proj.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pdist < proj.radius + en.width) {
              proj.life = 0; // explode ink ball
              en.health -= proj.damage;
              en.vx = proj.vx * 0.4;
              en.vy = -3;
              en.state = 'hurt';
              en.stunDuration = 10;
              spawnTextParticle(en.x, en.y - 45, `-${Math.round(proj.damage)}`, '#2563eb');
              spawnParticles(proj.x, proj.y, 8, 'ink', '#2563eb');
            }
          });
        } else {
          // Enemy arrow/ball hits player!
          const pdx = player.x - proj.x;
          const pdy = player.y - proj.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < proj.radius + 15) {
            proj.life = 0;
            if (isShieldProtected) {
              // Block & reflect projectile back at enemies!
              playShield();
              proj.fromPlayer = true;
              proj.vx = -proj.vx * 1.5;
              proj.vy = -proj.vy;
              proj.life = 120; // reset life
              spawnTextParticle(player.x, player.y - 40, 'REFLECTED!', '#10b981');
              spawnParticles(proj.x, proj.y, 5, 'spark', '#10b981');
            } else if (player.dashTimer === 0) {
              // Take damage!
              takePlayerDamage(proj.damage, 'PROJECTILE');
              spawnParticles(proj.x, proj.y, 6, 'ink', '#ef4444');
            }
          }
        }
      });

      // Erase dead/expired projectiles
      projectilesRef.current = projectilesRef.current.filter((p) => p.life > 0);

      // 7. Particles physics tracking
      particlesRef.current.forEach((part) => {
        part.x += part.vx;
        part.y += part.vy;
        part.life -= part.decay;
        // Gravity applied to inks splash
        if (part.type === 'ink') {
          part.vy += 0.16;
        }
      });
      // Filter out faded ones
      particlesRef.current = particlesRef.current.filter((prt) => prt.life > 0);

      // Handle custom timers
      if (player.hurtTimer > 0) player.hurtTimer--;
      if (player.shieldTimer > 0) player.shieldTimer--;

      // Render Smoothened Camera Offset following Player horizontally
      const canvas = canvasRef.current;
      if (canvas) {
        const destX = player.x - canvas.width / 2;
        cameraXRef.current += (destX - cameraXRef.current) * 0.08;
      }
    };

    // Subroutine to process damage to the main character
    const takePlayerDamage = (amount: number, label: string) => {
      const player = playerRef.current;
      if (player.dashTimer > 0 || player.shieldTimer > 0 || gameState !== 'playing') return;

      playHurt();
      player.hurtTimer = 18; // Flashing frames
      player.vx = player.isFacingLeft ? 5 : -5; // knock player back
      
      setStats((prev) => {
        const nextHealth = Math.max(0, prev.health - amount);
        if (nextHealth <= 0) {
          gameStateOverTrigger();
        }
        return {
          ...prev,
          health: nextHealth
        };
      });

      spawnTextParticle(player.x, player.y - 45, `${label} -${Math.round(amount)}`, '#dc2626');
      spawnParticles(player.x, player.y - 15, 8, 'ink', '#dc2626');
    };

    // Slam ground splash shockwaves generator
    const executeGroundSlamSplash = () => {
      const player = playerRef.current;
      playGroundSlam();
      spawnParticles(player.x, player.y, 14, 'spark', '#ea580c');
      spawnTextParticle(player.x, player.y - 45, 'GRID SMASH!', '#ea580c');

      // Create two shockwaves moving outward left and right!
      const leftId = 'slam-l-' + Math.random();
      const rightId = 'slam-r-' + Math.random();
      projectilesRef.current.push({
        id: leftId,
        x: player.x,
        y: player.y,
        vx: -8,
        vy: 0,
        radius: 12,
        damage: 40 + stats.attackLvl * 5,
        fromPlayer: true,
        type: 'shockwave',
        life: 25
      });
      projectilesRef.current.push({
        id: rightId,
        x: player.x,
        y: player.y,
        vx: 8,
        vy: 0,
        radius: 12,
        damage: 40 + stats.attackLvl * 5,
        fromPlayer: true,
        type: 'shockwave',
        life: 25
      });
    };

    const gameStateWinTrigger = () => {
      playLevelWin();
      // Set completed in stages
      const activeStage = stages.find((s) => s.id === currentStageId)!;
      setStages((prev) =>
        prev.map((s) => (s.id === currentStageId ? { ...s, completed: true } : s))
      );
      // Give rewards
      setStats((prev) => ({
        ...prev,
        coins: prev.coins + activeStage.baseReward
      }));
      setGameState('victory');
    };

    const gameStateOverTrigger = () => {
      playLevelFail();
      setGameState('gameover');
    };

    // Draw frame graphics
    const drawScene = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cameraX = cameraXRef.current;

      // Reset
      ctx.clearRect(0, 0, width, height);

      // Pencil paper background representation
      drawPaperBackground(ctx, width, height, cameraX, playerRef.current.hurtTimer > 0);

      // Draw all solid platforms
      platformsRef.current.forEach((plat) => {
        drawPlatform(ctx, plat, cameraX);
      });

      // Draw all flying projectiles
      projectilesRef.current.forEach((proj) => {
        drawProjectile(ctx, proj, cameraX);
      });

      // Draw active particles (splats, sparks, bubbles etc.)
      particlesRef.current.forEach((part) => {
        drawParticle(ctx, part, cameraX);
      });

      // Draw Active Shield Bubble if casted
      const player = playerRef.current;
      if (player.shieldTimer > 0) {
        drawSketchCircle(
          ctx,
          player.x - cameraX,
          player.y - 15,
          32,
          'rgba(16, 185, 129, 0.85)',
          2.5,
          1.2,
          true,
          'rgba(16, 185, 129, 0.08)',
          'user-shield-bubble'
        );
      }

      // Draw enemies
      enemiesRef.current.forEach((en) => {
        drawStickman(
          ctx,
          en,
          en.vy === 0 ? (en.vx !== 0 ? Math.sin(Date.now() / 150) : 0) : 0.99, // dynamic run tick
          en.type === 'boss' ? null : 'fists', // Default weapon represent
          en.state === 'attack',
          en.isFacingLeft ? Math.PI : 0,
          '#1f2937',
          en.type === 'boss' ? '#ef4444' : '#6b7280',
          en.stunDuration > 0
        );
      });

      // Draw Player Stickman
      drawStickman(
        ctx,
        {
          x: player.x,
          y: player.y,
          isFacingLeft: player.isFacingLeft,
          state: player.dashTimer > 0 ? 'chase' : player.isJumping ? 'falling' : Math.abs(player.vx) > 0.3 ? 'chase' : 'idle',
          health: stats.health,
          maxHealth: stats.maxHealth
        },
        player.animProgress,
        activeWeaponId,
        player.isAttacking,
        player.isAttacking ? player.swordAngle : player.aimAngle,
        '#111827',
        '#2563eb',
        player.hurtTimer > 0
      );
    };

    // Launch loop
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentStageId, activeWeaponId, stats, weapons, abilities]);

  // Handle Resize sizing bounds
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = windowSize.width;
    canvas.height = Math.min(650, windowSize.height);
  }, [windowSize]);

  // Virtual buttons inputs handler for Touchpads
  const handleVirtualRun = (dir: number) => {
    initAudio();
    setTouchActive(true);
    setJoystickPos({ x: dir, y: 0 });
  };

  const stopVirtualRun = () => {
    setJoystickPos({ x: 0, y: 0 });
  };

  const executeVirtualJump = () => {
    initAudio();
    const player = playerRef.current;
    if (!player.isJumping) {
      playJump();
      player.vy = -12.5;
      player.isJumping = true;
      spawnParticles(player.x, player.y, 4, 'pencil', '#9e9e9e');
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-start bg-[#111111] select-none touch-none overflow-hidden leading-none font-mono">
      
      {/* Top Banner decorative title */}
      <div className="h-11 border-b-2 border-black px-4 bg-[#181818] flex items-center justify-between text-xs font-mono font-bold text-neutral-400 shrink-0">
        <span className="flex items-center gap-1.5 text-cyan-400 font-extrabold uppercase select-none tracking-wider">
          <span className="inline-block w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          📓 STICKBOOK PHYSX COMBAT
        </span>
        <span className="hidden md:inline-block text-neutral-500 text-[10px] tracking-wide">DESKTOP: WASD/ARROWS TO RUN/JUMP • MOUSE TO SWING MELEE • ABILITIES: SHIFT / Q / E / F / V</span>
        <span className="md:hidden text-amber-400 text-[10px] tracking-wide">VIRTUAL TOUCH CONTROLLER ACTIVE</span>
      </div>

      {/* Main Canvas Segment */}
      <div className="relative flex-1 bg-stone-900 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          id="drawing-combat-canvas"
          className="w-full h-full cursor-crosshair border-b border-stone-850 shadow-inner bg-[#E8E4D9]"
        />

        {/* Floating overlays for Shop and HUD menus */}
        <GameUI
          stats={stats}
          weapons={weapons}
          abilities={abilities}
          stages={stages}
          currentStageId={currentStageId}
          gameState={gameState}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onSelectStage={setCurrentStageId}
          onBuyWeapon={handleBuyWeapon}
          onBuyAbility={handleBuyAbility}
          onUpgradeStat={handleUpgradeStat}
          onStartGame={startCurrentStage}
          onGoToShop={() => setGameState('shopper')}
          onGoToMenu={() => setGameState('start')}
          onResumeGame={() => setGameState('playing')}
          activeWeaponId={activeWeaponId}
          onEquipWeapon={setActiveWeaponId}
          onPauseGame={() => setGameState('paused')}
        />

        {/* MOBILE CONTROLLERS OVERLAY */}
        {gameState === 'playing' && (
          <div className="absolute inset-x-0 bottom-8 px-6 py-2 pointer-events-none select-none flex justify-between items-end z-10 md:hidden scale-90">
            {/* Left Side: Touch D-pad runners */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onTouchStart={() => handleVirtualRun(-1.0)}
                onTouchEnd={stopVirtualRun}
                className="w-16 h-16 rounded-full border-2 border-black bg-neutral-900/90 hover:bg-neutral-850 flex items-center justify-center text-cyan-400 font-mono font-black text-2xl shadow-[4px_4px_0px_#000] active:translate-y-0.5 cursor-pointer"
              >
                ◀
              </button>
              <button
                onTouchStart={() => handleVirtualRun(1.0)}
                onTouchEnd={stopVirtualRun}
                className="w-16 h-16 rounded-full border-2 border-black bg-neutral-900/90 hover:bg-neutral-850 flex items-center justify-center text-cyan-400 font-mono font-black text-2xl shadow-[4px_4px_0px_#000] active:translate-y-0.5 cursor-pointer"
              >
                ▶
              </button>
            </div>

            {/* Right Side: Jump and Attack buttons matrices */}
            <div className="pointer-events-auto flex flex-col gap-2 items-end">
              {/* Quick specials shortcuts */}
              <div className="flex gap-2.5 mb-2">
                {abilities.map((abi) => {
                  if (!abi.unlocked) return null;
                  let color = "bg-cyan-500 text-black";
                  if (abi.id === 'shield') color = "bg-emerald-500 text-white";
                  if (abi.id === 'fireball') color = "bg-rose-500 text-white";
                  if (abi.id === 'groundslam') color = "bg-purple-500 text-white";

                  return (
                    <button
                      key={abi.id}
                      onTouchStart={() => castAbility(abi.id)}
                      className={`w-11 h-11 rounded-full border-2 border-black ${color} text-[9px] font-black uppercase flex items-center justify-center shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer`}
                    >
                      {abi.id === 'groundslam' ? 'SLAM' : abi.id.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                {/* Jump trigger */}
                <button
                  onTouchStart={executeVirtualJump}
                  className="w-16 h-16 rounded-full border-2 border-black bg-yellow-400 text-black flex flex-col items-center justify-center font-black text-xs shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer"
                >
                  <span>JUMP</span>
                </button>

                {/* Primary swing trigger */}
                <button
                  onTouchStart={triggerMeleeAttack}
                  className="w-18 h-18 rounded-full border-2 border-black bg-[#ff3b30] text-white flex flex-col items-center justify-center text-xs font-black shadow-[4px_4px_0px_#000] active:translate-y-0.5 cursor-pointer"
                >
                  <span>HIT</span>
                  <span className="text-[8px] opacity-80 uppercase tracking-widest mt-0.5">SWEEP</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
