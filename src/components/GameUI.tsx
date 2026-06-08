import { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Sword,
  Coins,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  ChevronRight,
  User,
  Flame,
  Dribbble,
  Maximize2,
  Circle,
  HelpCircle,
  TrendingUp,
  Award,
  Play
} from 'lucide-react';
import { Weapon, SpecialAbility, PlayerStats, Stage, WeaponType, SpecialAbilityType } from '../types';

interface GameUIProps {
  stats: PlayerStats;
  weapons: Weapon[];
  abilities: SpecialAbility[];
  stages: Stage[];
  currentStageId: number;
  gameState: 'start' | 'playing' | 'paused' | 'victory' | 'gameover' | 'shopper';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectStage: (id: number) => void;
  onBuyWeapon: (id: WeaponType) => void;
  onBuyAbility: (id: SpecialAbilityType) => void;
  onUpgradeStat: (type: 'health' | 'speed' | 'damage' | 'cooldown') => void;
  onStartGame: () => void;
  onGoToShop: () => void;
  onGoToMenu: () => void;
  onResumeGame: () => void;
  activeWeaponId: WeaponType;
  onEquipWeapon: (id: WeaponType) => void;
  onPauseGame: () => void;
}

export function GameUI({
  stats,
  weapons,
  abilities,
  stages,
  currentStageId,
  gameState,
  soundEnabled,
  onToggleSound,
  onSelectStage,
  onBuyWeapon,
  onBuyAbility,
  onUpgradeStat,
  onStartGame,
  onGoToShop,
  onGoToMenu,
  onResumeGame,
  activeWeaponId,
  onEquipWeapon,
  onPauseGame
}: GameUIProps) {
  const [showHowTo, setShowHowTo] = useState(false);
  
  // Custom helper to render level stars or flags
  const selectedStage = stages.find((s) => s.id === currentStageId) || stages[0];

  const statCosts = {
    health: (stats.maxHealthLvl + 1) * 75,
    speed: (stats.speedLvl + 1) * 100,
    damage: (stats.attackLvl + 1) * 120,
    cooldown: (stats.abilityCooldownLvl + 1) * 150
  };

  if (gameState === 'start') {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-[#1a1a1a] font-mono overflow-y-auto select-none">
        {/* Immersive paper texture grid overlay background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\".6\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\"/%3E%3C/svg%3E')" }}></div>
        
        <div className="w-full max-w-2xl bg-neutral-900 border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_#000] relative text-white">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-2 border-2 border-black rounded bg-neutral-800 hover:bg-neutral-700 text-white transition active:translate-y-0.5 cursor-pointer"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-neutral-500" />}
            </button>
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="p-2 border-2 border-black rounded bg-neutral-800 hover:bg-neutral-700 text-white transition active:translate-y-0.5 cursor-pointer"
              title="Help and Guide"
            >
              <HelpCircle className="w-5 h-5 text-cyan-500" />
            </button>
          </div>

          {/* Sketchy title header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter select-none font-mono flex items-center justify-center gap-3">
              <span className="text-cyan-400 border-b-4 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] text-shadow-sm">STICKMAN</span>
              <span className="text-rose-500 border-b-4 border-rose-500">PHYSICS</span>
            </h1>
            <p className="mt-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">Procedural Sketchbook Combat • V2.4</p>
          </div>

          {showHowTo && (
            <div className="mb-6 p-4 border-2 border-dashed border-white/20 rounded-lg bg-black/60 select-none animate-fade-in text-sm text-neutral-300 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <Sword className="w-4 h-4 text-cyan-400" /> Controls & Melee Attacks:
              </h3>
              <ul className="list-disc pl-5 list-inside space-y-1 text-xs">
                <li><kbd className="px-1.5 py-0.5 bg-neutral-800 text-white rounded text-xs border border-white/10 shadow-sm font-mono font-bold">A / D</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 text-white rounded text-xs border border-white/10 shadow-sm font-mono font-bold">← / →</kbd> to Run Left / Right</li>
                <li><kbd className="px-1.5 py-0.5 bg-neutral-800 text-white rounded text-xs border border-white/10 shadow-sm font-mono font-bold">W</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 text-white rounded text-xs border border-white/10 shadow-sm font-mono font-bold">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 text-white rounded text-xs border border-white/10 shadow-sm font-mono font-bold">↑</kbd> to Jump</li>
                <li><strong>Aim with your Mouse Cursor</strong> — Your hand procedural joints follow your mouse!</li>
                <li><strong>Left Mouse Click</strong> — Perform sweeping physical MELEE attack! Damage and knockback depend on your hit speed!</li>
              </ul>
              
              <h4 className="font-bold text-white mt-3 uppercase tracking-wide text-xs">Hotkeys for Special Abilities:</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-white/10 text-cyan-400 font-bold font-mono">Shift / Q</kbd>: Dash (Sketch-Blur)</div>
                <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-white/10 text-cyan-400 font-bold font-mono">E / C</kbd>: Ink Shield (Block & reflect)</div>
                <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-white/10 text-cyan-400 font-bold font-mono">F / R</kbd>: Ink Splat / Fireball</div>
                <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-white/10 text-cyan-400 font-bold font-mono">V / G</kbd>: Ground Slam Shockwave</div>
              </div>
              <p className="mt-2 text-neutral-500 italic text-[10px]">🎮 Full virtual joysticks/buttons automatically activate when touch screen is detected!</p>
            </div>
          )}

          {/* Grid: Main selection and stage progression */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Box: Stage list */}
            <div className="border-2 border-black rounded-lg p-4 bg-black/40">
              <h2 className="text-sm font-black text-neutral-400 mb-3 border-b border-white/10 pb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                <Award className="w-4 h-4 text-cyan-400" /> Stages Selection
              </h2>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {stages.map((stg) => {
                  const isUnlocked = stg.id === 1 || stages[stg.id - 2]?.completed;
                  const isSelected = stg.id === currentStageId;

                  return (
                    <button
                      key={stg.id}
                      onClick={() => isUnlocked && onSelectStage(stg.id)}
                      disabled={!isUnlocked}
                      className={`w-full text-left p-2.5 border-2 rounded transition flex items-center justify-between text-xs cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400/10 font-bold text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                          : isUnlocked
                          ? 'border-white/10 bg-neutral-800 hover:border-cyan-400 hover:bg-neutral-700 text-white'
                          : 'border-neutral-900 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <div className={`w-2 h-2 rounded-full ${stg.completed ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : isUnlocked ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-neutral-700'}`} />
                        <span>STAGE {stg.id < 10 ? `0${stg.id}` : stg.id}: {stg.name}</span>
                      </div>
                      {stg.completed && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20 rounded font-bold font-mono">CLEAR</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Box: Stage info and Launch */}
            <div className="flex flex-col justify-between">
              <div className="border-2 border-black bg-black/40 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-neutral-400 text-xs border-b border-white/10 pb-1.5 flex items-center justify-between uppercase tracking-widest">
                  <span>STAGE DETAILS</span>
                  <span className="text-[10px] text-rose-400 uppercase font-mono tracking-wider font-bold">
                    Inkwell Fort
                  </span>
                </h3>
                <p className="text-xs font-black text-white tracking-tight uppercase font-mono">{selectedStage.name}</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                  "{selectedStage.description}"
                </p>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono font-medium text-neutral-400 pt-1">
                  <div>
                    🔥 Enemies: <span className="text-white font-bold">{selectedStage.waveConfig[0]?.count || 0}</span>
                  </div>
                  <div>
                    💰 Reward: <span className="text-emerald-400 font-bold font-mono">+{selectedStage.baseReward} coins</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={onGoToShop}
                  className="py-3 px-4 border-2 border-black font-black uppercase text-xs rounded bg-yellow-400 hover:bg-white text-black transition-all skew-x-[-10deg] shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-black" />
                  <span>Stats & Shop</span>
                </button>

                <button
                  onClick={onStartGame}
                  className="py-3 px-4 border-2 border-black font-black uppercase text-xs rounded bg-cyan-400 hover:bg-white text-black transition-all skew-x-[-10deg] shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-black fill-black" />
                  <span>START PLAY [W]</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'shopper') {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-[#1a1a1a] font-mono overflow-y-auto select-none">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\".6\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\"/%3E%3C/svg%3E')" }}></div>
        
        <div className="w-full max-w-4xl bg-neutral-900 border-4 border-black rounded-2xl p-6 md:p-8 shadow-[8px_8px_0px_#000] relative text-white animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Coins className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
                <span>INKWELL COMBAT BAZAAR</span>
              </h1>
              <p className="text-neutral-400 text-xs tracking-wider">UPGRADE ATTRIBUTES, FORGE MELEE WEAPONS, AND WEAVE ACTIVE SPECIALS.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Wallet */}
              <div className="px-4 py-2 border-2 border-black bg-black/60 rounded-lg flex items-center gap-2 text-yellow-400 font-bold font-mono">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>{stats.coins} COINS</span>
              </div>
              <button
                onClick={onGoToMenu}
                className="px-4 py-2 border-2 border-black rounded font-black bg-white hover:bg-cyan-400 text-black uppercase transition-all text-xs skew-x-[-10deg] cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5"
              >
                RETURN TO MENU
              </button>
            </div>
          </div>

          {/* Layout sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Core Character Stat Upgrades */}
            <div className="border-2 border-black rounded-xl p-4 bg-black/30">
              <h2 className="text-sm font-black text-neutral-400 border-b border-white/10 pb-2 mb-4 flex items-center gap-1.5 uppercase tracking-widest">
                <User className="w-4 h-4 text-cyan-400" /> Attributes
              </h2>
              
              <div className="space-y-4">
                {/* Health */}
                <div className="p-3 bg-neutral-800/80 border-2 border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-white">
                    <span>MAX HEALTH (Lvl {stats.maxHealthLvl})</span>
                    <span className="text-rose-400 font-mono">+{stats.maxHealthLvl * 20} HP</span>
                  </div>
                  <div className="text-neutral-400 text-[11px] leading-tight font-sans">Increases maximum health pool to withstand harder boss hits.</div>
                  <button
                    onClick={() => onUpgradeStat('health')}
                    disabled={stats.coins < statCosts.health || stats.maxHealthLvl >= 10}
                    className={`w-full py-2 border border-black rounded font-black font-mono text-xs flex justify-between px-3 skew-x-[-10deg] shadow-[2px_2px_0px_#000] active:scale-98 cursor-pointer ${
                      stats.maxHealthLvl >= 10
                        ? 'bg-neutral-900 border-neutral-950 text-neutral-600'
                        : stats.coins >= statCosts.health
                        ? 'border-black bg-rose-500 hover:bg-white text-white hover:text-black transition-all'
                        : 'border-neutral-950 bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{stats.maxHealthLvl >= 10 ? 'MAX OUT' : 'UPGRADE HP'}</span>
                    <span>{stats.maxHealthLvl >= 10 ? '' : `${statCosts.health} C`}</span>
                  </button>
                </div>

                {/* Speed */}
                <div className="p-3 bg-neutral-800/80 border-2 border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-white">
                    <span>SPRINT VELOCITY (Lvl {stats.speedLvl})</span>
                    <span className="text-cyan-400 font-mono">+{stats.speedLvl * 8}% SPD</span>
                  </div>
                  <div className="text-neutral-400 text-[11px] leading-tight font-sans">Gives swift drafted motion for kiting heavy warriors.</div>
                  <button
                    onClick={() => onUpgradeStat('speed')}
                    disabled={stats.coins < statCosts.speed || stats.speedLvl >= 10}
                    className={`w-full py-2 border border-black rounded font-black font-mono text-xs flex justify-between px-3 skew-x-[-10deg] shadow-[2px_2px_0px_#000] active:scale-98 cursor-pointer ${
                      stats.speedLvl >= 10
                        ? 'bg-neutral-900 border-neutral-950 text-neutral-600'
                        : stats.coins >= statCosts.speed
                        ? 'border-black bg-cyan-500 hover:bg-white text-white hover:text-black transition-all'
                        : 'border-neutral-950 bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{stats.speedLvl >= 10 ? 'MAX OUT' : 'UPGRADE SPD'}</span>
                    <span>{stats.speedLvl >= 10 ? '' : `${statCosts.speed} C`}</span>
                  </button>
                </div>

                {/* Damage */}
                <div className="p-3 bg-neutral-800/80 border-2 border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-white">
                    <span>MELEE STRENGTH (Lvl {stats.attackLvl})</span>
                    <span className="text-purple-400 font-mono">+{stats.attackLvl * 15}% DMG</span>
                  </div>
                  <div className="text-neutral-400 text-[11px] leading-tight font-sans">Sharpens carbon density to deliver massive physics shocks.</div>
                  <button
                    onClick={() => onUpgradeStat('damage')}
                    disabled={stats.coins < statCosts.damage || stats.attackLvl >= 10}
                    className={`w-full py-2 border border-black rounded font-black font-mono text-xs flex justify-between px-3 skew-x-[-10deg] shadow-[2px_2px_0px_#000] active:scale-98 cursor-pointer ${
                      stats.attackLvl >= 10
                        ? 'bg-neutral-900 border-neutral-950 text-neutral-600'
                        : stats.coins >= statCosts.damage
                        ? 'border-black bg-purple-500 hover:bg-white text-white hover:text-black transition-all'
                        : 'border-neutral-950 bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{stats.attackLvl >= 10 ? 'MAX OUT' : 'UPGRADE ATK'}</span>
                    <span>{stats.attackLvl >= 10 ? '' : `${statCosts.damage} C`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Weapons Draft */}
            <div className="border-2 border-black rounded-xl p-4 bg-black/30">
              <h2 className="text-sm font-black text-neutral-400 border-b border-white/10 pb-2 mb-4 flex items-center gap-1.5 uppercase tracking-widest">
                <Sword className="w-4 h-4 text-rose-400" /> MELEE CACHE
              </h2>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {weapons.map((wpn) => {
                  const isActive = activeWeaponId === wpn.id;
                  return (
                    <div key={wpn.id} className="p-3 bg-neutral-800/80 border-2 border-white/5 rounded-lg space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center font-bold text-white uppercase">
                        <span className="flex items-center gap-1">
                          <Circle className="w-2 h-2" style={{ fill: wpn.color, color: wpn.color }} />
                          {wpn.name}
                        </span>
                        {!wpn.unlocked ? (
                          <span className="text-rose-400 bg-rose-950/40 border border-rose-900 px-1.5 py-0.2 rounded text-[10px]">LOCKED</span>
                        ) : isActive ? (
                          <span className="text-cyan-400 bg-cyan-950/40 border border-cyan-800 px-1.5 py-0.2 rounded text-[10px] shadow-[0_0_8px_#22d3ee]">EQIPD</span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-1.5 py-0.2 rounded text-[10px]">OWNED</span>
                        )}
                      </div>
                      
                      <div className="text-neutral-400 text-[10px] leading-tight font-sans">{wpn.description}</div>
                      <div className="grid grid-cols-3 gap-1 text-[9px] text-neutral-300 bg-neutral-900/60 p-1 border border-white/5 rounded">
                        <div>⚔️ Dmg: <span className="font-bold text-white">{wpn.damage}</span></div>
                        <div>📏 Rng: <span className="font-bold text-white">{wpn.range}</span></div>
                        <div>🌀 Spd: <span className="font-bold text-white">{wpn.swingSpeed}ms</span></div>
                      </div>

                      {!wpn.unlocked ? (
                        <button
                          onClick={() => onBuyWeapon(wpn.id)}
                          disabled={stats.coins < wpn.cost}
                          className={`w-full py-1.5 border border-black rounded font-black text-xs flex justify-between px-3 skew-x-[-10deg] cursor-pointer ${
                            stats.coins >= wpn.cost
                              ? 'border-black bg-yellow-400 hover:bg-white text-black transition-all'
                              : 'border-neutral-950 bg-neutral-900 text-neutral-600 cursor-not-allowed'
                          }`}
                        >
                          <span>BUY MELEE WEAPON</span>
                          <span>{wpn.cost} Coins</span>
                        </button>
                      ) : (
                        !isActive && (
                          <button
                            onClick={() => onEquipWeapon(wpn.id)}
                            className="w-full py-1.5 border border-black rounded font-black bg-neutral-700 text-white hover:bg-cyan-400 hover:text-black text-xs transition-all skew-x-[-10deg] cursor-pointer"
                          >
                            SELECT MELEE
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Active Special Abilities */}
            <div className="border-2 border-black rounded-xl p-4 bg-black/30">
              <h2 className="text-sm font-black text-neutral-400 border-b border-white/10 pb-2 mb-4 flex items-center gap-1.5 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} /> SPECIALS
              </h2>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {abilities.map((abi) => {
                  const iconStyle = "w-4 h-4";
                  let Icon = Zap;
                  if (abi.id === 'shield') Icon = ShieldAlert;
                  if (abi.id === 'fireball') Icon = Flame;
                  if (abi.id === 'groundslam') Icon = Dribbble;

                  return (
                    <div key={abi.id} className="p-3 bg-neutral-800/80 border-2 border-white/5 rounded-lg space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center font-bold text-white uppercase">
                        <span className="flex items-center gap-1.5">
                          <Icon className={`${iconStyle} text-purple-400`} />
                          {abi.name}
                        </span>
                        {abi.unlocked ? (
                          <span className="text-purple-400 bg-purple-950/40 border border-purple-900 px-1.5 py-0.2 rounded text-[10px] shadow-[0_0_6px_rgba(168,85,247,0.4)] font-bold">READY</span>
                        ) : (
                          <span className="text-rose-450 bg-rose-950/40 border border-rose-900 px-1 py-0.2 rounded text-[10px]">LOCKED</span>
                        )}
                      </div>

                      <div className="text-neutral-400 text-[10px] leading-tight font-sans">{abi.description}</div>
                      <div className="text-[9px] text-neutral-400">🧬 Cooldown: {(abi.cooldown / 1000).toFixed(1)}s elapsed</div>

                      {!abi.unlocked && (
                        <button
                          onClick={() => onBuyAbility(abi.id)}
                          disabled={stats.coins < abi.cost}
                          className={`w-full py-1.5 border border-black rounded font-black text-xs flex justify-between px-3 skew-x-[-10deg] cursor-pointer ${
                            stats.coins >= abi.cost
                              ? 'border-black bg-purple-500 hover:bg-white text-white hover:text-black transition-all'
                              : 'border-neutral-950 bg-neutral-900 text-neutral-600 cursor-not-allowed'
                          }`}
                        >
                          <span>UNLOCK GRID ACT</span>
                          <span>{abi.cost} C</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Active Combat HUD Overlay
  return (
    <>
      <div className="absolute inset-x-0 top-0 p-4 z-10 flex justify-between items-start pointer-events-none select-none font-mono">
        {/* Left Side: Health and Level attributes */}
        <div className="pointer-events-auto flex flex-col gap-2 scale-90 md:scale-100 origin-top-left">
          <div className="w-64 bg-neutral-900/90 border-2 border-black rounded-lg p-2.5 shadow-[4px_4px_0px_#000] text-white">
            <div className="flex justify-between items-center text-[10px] font-black text-neutral-300 mb-1">
              <span className="flex items-center gap-1 text-cyan-400">⚔️ CANVAS WARRIOR</span>
              <span className="font-mono text-cyan-400">{Math.max(0, Math.floor(stats.health))} / {stats.maxHealth} HP</span>
            </div>
            
            {/* Outline health gauge */}
            <div className="w-full h-4 bg-black border border-white/10 rounded overflow-hidden p-0.5 relative">
              <div
                className="h-full bg-rose-500 rounded-sm transition-all duration-100"
                style={{ width: `${Math.max(0, (stats.health / stats.maxHealth) * 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black tracking-widest pointer-events-none text-white mix-blend-difference">
                LP SYSTEM
              </div>
            </div>

            {/* EXP Bar */}
            <div className="mt-2 w-full h-2 bg-black border border-white/5 rounded overflow-hidden p-0.5 relative">
              <div
                className="h-full bg-cyan-400 rounded-sm transition-all"
                style={{ width: `${Math.max(0, (stats.xp / stats.nextLevelXp) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-neutral-400 font-bold mt-1">
              <span>LVL {stats.level}</span>
              <span className="font-mono">XP: {stats.xp}/{stats.nextLevelXp}</span>
            </div>
          </div>
        </div>

        {/* Center: Wave / Win Condition Meter */}
        <div className="bg-neutral-900/90 border-2 border-black rounded-lg py-2 px-4 shadow-[4px_4px_0px_#000] max-w-[200px] text-center text-white">
          <span className="block text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest">STATION MISSION</span>
          <span className="block text-xs font-black truncate font-mono uppercase tracking-tight">{selectedStage.name}</span>
        </div>

        {/* Right Side: Menu trigger and Wallet */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            onClick={onToggleSound}
            className="p-1.5 border-2 border-black rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* Pause game button */}
          <button
            onClick={onPauseGame}
            className="py-1.5 px-3 border-2 border-black rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer uppercase tracking-wider"
          >
            PAUSE
          </button>

          <div className="px-3.5 py-1.5 border-2 border-black bg-neutral-900 rounded-lg text-yellow-400 font-bold font-mono shadow-[3px_3px_0px_#000] flex items-center gap-1.5 text-xs">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>{stats.coins}</span>
          </div>
        </div>
      </div>

      {/* Floating active abilities cooldown indicators at bottom border */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3 pointer-events-none select-none font-mono">
        {abilities.map((abi) => {
          if (!abi.unlocked) return null;
          
          let Icon = Zap;
          let keycode = "SHIFT";
          if (abi.id === 'shield') {
            Icon = ShieldAlert;
            keycode = "E";
          }
          if (abi.id === 'fireball') {
            Icon = Flame;
            keycode = "F";
          }
          if (abi.id === 'groundslam') {
            Icon = Dribbble;
            keycode = "V";
          }

          const now = Date.now();
          const elapsed = now - abi.lastUsed;
          const isOffCooldown = elapsed >= abi.cooldown;
          const percentRemaining = isOffCooldown ? 0 : ((abi.cooldown - elapsed) / abi.cooldown) * 100;

          return (
            <div
              key={abi.id}
              className={`pointer-events-auto p-2 bg-neutral-900/90 border-2 rounded-xl shadow-[3px_3px_0px_#000] text-center w-14 relative ${
                isOffCooldown ? 'border-cyan-400 text-cyan-400' : 'border-neutral-800 text-neutral-500 opacity-60'
              }`}
            >
              {!isOffCooldown && (
                <div
                  className="absolute bottom-0 inset-x-0 bg-neutral-950/40 rounded-b-xl transition-all"
                  style={{ height: `${percentRemaining}%` }}
                />
              )}
              <Icon className={`w-5 h-5 mx-auto ${isOffCooldown ? 'text-cyan-400' : 'text-neutral-600'}`} />
              <div className="text-[8px] font-black mt-1 uppercase tracking-widest">{keycode}</div>
            </div>
          );
        })}
      </div>

      {/* PAUSE PANEL */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-25 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_#000] max-w-sm w-full text-center text-white">
            <h2 className="text-2xl font-black text-rose-500 mb-2 font-mono uppercase tracking-tight">STATION PAUSED</h2>
            <p className="text-neutral-400 text-xs mb-6 font-mono uppercase tracking-wide">SHARPEN YOUR SKETCHES PRIOR TO BOSS DUELS!</p>

            <div className="space-y-3 font-mono">
              <button
                onClick={onResumeGame}
                className="w-full py-2.5 border-2 border-black rounded bg-cyan-400 hover:bg-white text-black font-black uppercase transition-all skew-x-[-10deg] shadow-[4px_4px_0px_#000] active:translate-y-0.5 cursor-pointer text-xs"
              >
                RESUME STRUGGLE
              </button>
              <button
                onClick={onGoToShop}
                className="w-full py-2.5 border-2 border-black rounded bg-yellow-400 hover:bg-white text-black font-black uppercase transition-all skew-x-[-10deg] shadow-[4px_4px_0px_#000] active:translate-y-0.5 cursor-pointer text-xs"
              >
                VISIT THE SHOP
              </button>
              <button
                onClick={onGoToMenu}
                className="w-full py-2.5 border-2 border-black rounded bg-neutral-800 hover:bg-neutral-700 text-white font-semibold uppercase transition-all skew-x-[-10deg] shadow-[4px_4px_0px_#000] active:translate-y-0.5 cursor-pointer text-xs"
              >
                QUIT MISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY OVERLAY */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-25 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border-4 border-black text-white rounded-2xl p-8 shadow-[8px_8px_0px_#000] max-w-md w-full relative">
            <div className="text-center space-y-3 font-mono">
              <div className="w-16 h-16 bg-neutral-800 rounded-full border-2 border-black flex items-center justify-center mx-auto text-yellow-400 animate-bounce shadow-[0_0_12px_rgba(250,204,21,0.5)]">
                <Award className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-black text-cyan-400 tracking-tight uppercase">STATION CLEARED!</h2>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{selectedStage.name} BEATEN!</p>
              
              <div className="my-6 p-4 border-2 border-black bg-black/40 rounded-lg text-left text-xs space-y-2">
                <div className="flex justify-between text-white font-bold uppercase">
                  <span>💰 WAVES TREASURE:</span>
                  <span className="text-yellow-400 font-bold">+{selectedStage.baseReward} COINS</span>
                </div>
                <div className="flex justify-between text-white font-bold uppercase">
                  <span>📈 EXP ACCRETION:</span>
                  <span className="text-cyan-400 font-bold">+{selectedStage.baseReward * 1.5} XP</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  onClick={onGoToShop}
                  className="py-2.5 border-2 border-black rounded bg-yellow-400 hover:bg-white text-black font-black uppercase text-xs transition-all skew-x-[-10deg] cursor-pointer"
                >
                  UPGRADE HERO
                </button>
                <button
                  onClick={onGoToMenu}
                  className="py-2.5 border-2 border-black rounded bg-cyan-400 hover:bg-white text-black font-black uppercase text-xs transition-all skew-x-[-10deg] cursor-pointer"
                >
                  NEXT ASSIGNMENT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAMEOVER OVERLAY */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-25 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-4 border-black text-white rounded-2xl p-8 shadow-[8px_8px_0px_#000] max-w-sm w-full text-center font-mono">
            <h2 className="text-2xl font-black text-rose-500 mb-1 uppercase tracking-tight">INKED OUT</h2>
            <p className="text-neutral-400 text-xs mb-6 font-mono uppercase tracking-wide">WEAPONRY AND ENDURANCE BOOSTS REQUIRED FOR OUTLAW STAGES!</p>

            <div className="space-y-3 font-mono text-xs font-bold">
              <button
                onClick={onStartGame}
                className="w-full py-2.5 border border-black rounded bg-rose-500 hover:bg-white text-white hover:text-black font-black uppercase flex items-center justify-center gap-1.5 transition skew-x-[-10deg] cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5"
              >
                <RotateCcw className="w-4 h-4" /> RE-WRITE SESSION
              </button>
              <button
                onClick={onGoToShop}
                className="w-full py-2.5 border border-black rounded bg-yellow-400 hover:bg-white text-black font-black uppercase transition-all skew-x-[-10deg] cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5"
              >
                VISIT THE SHOP
              </button>
              <button
                onClick={onGoToMenu}
                className="w-full py-2.5 border border-black rounded bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase transition-all skew-x-[-10deg] cursor-pointer shadow-[3px_3px_0px_#000] active:translate-y-0.5"
              >
                LEAVE CANVAS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
