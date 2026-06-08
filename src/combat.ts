import { Vector, Enemy, Platform, Projectile, Particle, WeaponType, SpecialAbilityType } from './types';

// Seeded/random offsets for sketching effects to prevent seizure-inducing flickering
// We regenerate offsets every few frames instead of every single frame, or use pre-calculated wobbly steps
const wobbleCache: Record<string, number[]> = {};

function getWobble(id: string, count: number): number[] {
  if (!wobbleCache[id]) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(Math.random() * 2 - 1);
    }
    wobbleCache[id] = arr;
  }
  // Periodically fluctuate slightly
  if (Math.random() < 0.08) {
    const idx = Math.floor(Math.random() * count);
    wobbleCache[id][idx] = Math.random() * 2 - 1;
  }
  return wobbleCache[id];
}

// Draw a sketchy line with natural hand-drawn variations
export function drawSketchLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  thickness: number = 2,
  roughness: number = 1.2,
  cacheId?: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Choose segment count based on length
  const segmentLength = 20;
  const segments = Math.max(2, Math.floor(distance / segmentLength));
  
  // Retrieve or create stability wobble array
  const wobbles = cacheId ? getWobble(cacheId, segments * 2) : null;

  ctx.beginPath();
  ctx.moveTo(x1, y1);

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    let px = x1 + dx * t;
    let py = y1 + dy * t;

    // Normal vector for offset
    const nx = -dy / distance;
    const ny = dx / distance;

    const wobbleFactor = wobbles ? wobbles[i] : (Math.random() * 2 - 1);
    const offset = wobbleFactor * roughness * 1.5;

    px += nx * offset;
    py += ny * offset;

    ctx.lineTo(px, py);
  }

  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// Draw a sketchy rectangle using four wobbly lines
export function drawSketchRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  thickness: number = 2,
  roughness: number = 1,
  fill: boolean = false,
  fillColor?: string,
  cacheId?: string
) {
  if (fill && fillColor) {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  const id = cacheId || `${Math.round(x)}-${Math.round(y)}-${Math.round(w)}`;
  drawSketchLine(ctx, x, y, x + w, y, color, thickness, roughness, `${id}-top`);
  drawSketchLine(ctx, x + w, y, x + w, y + h, color, thickness, roughness, `${id}-right`);
  drawSketchLine(ctx, x + w, y + h, x, y + h, color, thickness, roughness, `${id}-bottom`);
  drawSketchLine(ctx, x, y + h, x, y, color, thickness, roughness, `${id}-left`);

  // Simple sketchy cross hatching inside rect
  if (fill && !fillColor) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const spacing = 10;
    for (let offset = spacing; offset < w; offset += spacing) {
      drawSketchLine(
        ctx,
        x + offset,
        y,
        x + Math.max(0, offset - h),
        y + Math.min(h, offset),
        color,
        1,
        roughness * 0.5,
        `${id}-hatch-${offset}`
      );
    }
    ctx.restore();
  }
}

// Draw sketchy circles using multiple overlapping semi-arcs
export function drawSketchCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  thickness: number = 2,
  roughness: number = 1,
  fill: boolean = false,
  fillColor?: string,
  cacheId?: string
) {
  if (r <= 0) return;
  
  if (fill && fillColor) {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';

  const id = cacheId || `${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;
  const segments = 12;
  const wobbles = getWobble(id, segments + 2);

  ctx.beginPath();
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wobbleIdx = i % segments;
    const wobble = wobbles[wobbleIdx] * roughness * 0.8;
    const currR = r + wobble;
    
    const px = cx + Math.cos(angle) * currR;
    const py = cy + Math.sin(angle) * currR;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.stroke();

  // Add an overlapping arc to make it look like pen scribbled twice
  ctx.beginPath();
  const offsetAngle = 0.5;
  for (let i = 0; i <= segments - 3; i++) {
    const angle = (i / segments) * Math.PI * 2 + offsetAngle;
    const wobbleIdx = (i + 4) % segments;
    const wobble = wobbles[wobbleIdx] * roughness * 0.8;
    const currR = r + wobble - 0.5;

    const px = cx + Math.cos(angle) * currR;
    const py = cy + Math.sin(angle) * currR;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.restore();
}

// Procedurally calculate and draw a Stickman (Player or Enemy)
export function drawStickman(
  ctx: CanvasRenderingContext2D,
  char: {
    x: number;
    y: number;
    isFacingLeft: boolean;
    state: string;
    health: number;
    maxHealth: number;
    type?: string;
  },
  animProgress: number, // 0 to 1 for walking, jumping, attacking cycles
  weaponType: WeaponType | null,
  isAttacking: boolean,
  aimAngle: number, // Rotation of weapon toward target
  color: string = '#222222',
  accessoryColor: string = '#2255cc',
  isHurt: boolean = false
) {
  const headRadius = char.type === 'boss' ? 24 : 10;
  const scale = char.type === 'boss' ? 2.5 : 1.0;
  
  const baseH = 26 * scale; // Spine/Torso height
  const hipW = 8 * scale;
  const limbL = 18 * scale;

  // Root position centers on pelvis/hip
  const hipX = char.x;
  const hipY = char.y;

  // Neck position
  let spineOffset = -baseH;
  if (char.state === 'chase' || char.state === 'patrol') {
    // Lean forward while running
    spineOffset = -baseH * 0.9;
  }
  
  const neckX = hipX + (char.isFacingLeft ? -4 : 4) * scale * (char.state === 'chase' ? 1.5 : 0.5);
  const neckY = hipY + spineOffset;

  // Head position
  const headX = neckX + (char.isFacingLeft ? -2 : 2) * scale;
  const headY = neckY - headRadius;

  // Left & Right Hips
  const lHipX = hipX - (char.isFacingLeft ? 2 : -2) * scale;
  const rHipX = hipX + (char.isFacingLeft ? 2 : -2) * scale;
  const hipsY = hipY;

  // Run cycle animation frames (Sine-based)
  const speedScale = char.state === 'chase' ? 2.2 : 1.2;
  const stride = Math.sin(animProgress * Math.PI * 2 * speedScale);
  const strideCos = Math.cos(animProgress * Math.PI * 2 * speedScale);

  let lKneeX = lHipX - 2 * scale;
  let lKneeY = hipsY + limbL * 0.6;
  let lFootX = lHipX - 4 * scale;
  let lFootY = hipsY + limbL;

  let rKneeX = rHipX + 2 * scale;
  let rKneeY = hipsY + limbL * 0.6;
  let rFootX = rHipX + 4 * scale;
  let rFootY = hipsY + limbL;

  // Procedural leg adjustment based on states
  if (char.state === 'dead') {
    // Slumped legs
    lFootX = hipX - limbL * 0.6;
    lFootY = hipY + 8 * scale;
    rFootX = hipX + limbL * 0.6;
    rFootY = hipY + 8 * scale;
    lKneeX = hipX - limbL * 0.3;
    lKneeY = hipY + 4 * scale;
    rKneeX = hipX + limbL * 0.3;
    rKneeY = hipY + 4 * scale;
  } else if (char.state === 'chase' || char.state === 'patrol') {
    // Running legs
    lKneeX = lHipX + stride * 8 * scale;
    lKneeY = hipsY + limbL * 0.5 + Math.abs(strideCos) * 2 * scale;
    lFootX = lHipX + stride * 14 * scale;
    lFootY = hipsY + limbL - Math.max(0, stride) * 6 * scale;

    rKneeX = rHipX - stride * 8 * scale;
    rKneeY = hipsY + limbL * 0.5 + Math.abs(stride) * 2 * scale;
    rFootX = rHipX - stride * 14 * scale;
    rFootY = hipsY + limbL - Math.max(0, -stride) * 6 * scale;
  } else if (Math.abs(animProgress - 0.99) < 0.05) {
    // Falling or jumping (procedural lift)
    lKneeY = hipsY + limbL * 0.4;
    lFootY = hipsY + limbL * 0.7;
    lFootX = lHipX - 6 * scale;

    rKneeY = hipsY + limbL * 0.4;
    rFootY = hipsY + limbL * 0.7;
    rFootX = rHipX + 6 * scale;
  }

  // Draw Head (use Red if hurt, black/charcoal normally, custom color for boss)
  const stickColor = isHurt ? '#ef4444' : color;
  const lineWeight = char.type === 'boss' ? 5 : 2.5;

  drawSketchCircle(ctx, headX, headY, headRadius, stickColor, lineWeight, 1.2, isHurt, isHurt ? 'rgba(239, 68, 68, 0.4)' : undefined, `${char.x}-head`);

  // Extra details (Boss Horns or Headband!)
  if (char.type === 'boss') {
    // Draw charcoal crown/horns
    drawSketchLine(ctx, headX - 10, headY - 18, headX - 18, headY - 32, '#b91c1c', 4, 1.5, `${char.x}-horn-l`);
    drawSketchLine(ctx, headX + 10, headY - 18, headX + 18, headY - 32, '#b91c1c', 4, 1.5, `${char.x}-horn-r`);
  } else if (char.type === 'speedster') {
    // Cool dual headband ties flying behind
    const flagLeft = char.isFacingLeft ? 8 : -8;
    drawSketchLine(ctx, headX - flagLeft, headY, headX - flagLeft * 2.5, headY + 5, '#dc2626', 2, 1.5, `${char.x}-headband-1`);
    drawSketchLine(ctx, headX - flagLeft, headY + 2, headX - flagLeft * 2.2, headY + 11, '#dc2626', 2, 1.5, `${char.x}-headband-2`);
  } else if (char.type === 'shield') {
    // Cool heavy metallic iron helmet shape
    drawSketchCircle(ctx, headX, headY + 2, headRadius + 2, '#4b5563', 2, 1.2, false, undefined, `${char.x}-helm`);
  } else if (char.type === 'archer') {
    // Simple sketchy green hood/feather
    drawSketchLine(ctx, headX, headY - 11, headX - (char.isFacingLeft ? -6 : 6), headY - 18, '#16a34a', 3, 1.2, `${char.x}-feather`);
  }

  // Draw Spine
  drawSketchLine(ctx, neckX, neckY, hipX, hipY, stickColor, lineWeight, 1.1, `${char.x}-spine`);

  // Draw Legs
  drawSketchLine(ctx, lHipX, hipsY, lKneeX, lKneeY, stickColor, lineWeight, 1.1, `${char.x}-l-femur`);
  drawSketchLine(ctx, lKneeX, lKneeY, lFootX, lFootY, stickColor, lineWeight, 1.1, `${char.x}-l-tobia`);
  drawSketchLine(ctx, rHipX, hipsY, rKneeX, rKneeY, stickColor, lineWeight, 1.1, `${char.x}-r-femur`);
  drawSketchLine(ctx, rKneeX, rKneeY, rFootX, rFootY, stickColor, lineWeight, 1.1, `${char.x}-r-tobia`);

  // Hand / Weapon joint setup
  // Left Arm (Back arm)
  let lHandX = neckX - (char.isFacingLeft ? -10 : 10) * scale;
  let lHandY = neckY + 14 * scale;

  // Right Arm (Front arm, usually controls weapon!)
  let rHandX = neckX + (char.isFacingLeft ? -14 : 14) * scale;
  let rHandY = neckY + 14 * scale;

  if (char.state === 'dead') {
    lHandX = hipX - 10 * scale; lHandY = hipY + 14 * scale;
    rHandX = hipX + 10 * scale; rHandY = hipY + 14 * scale;
  } else if (isAttacking || char.state === 'attack') {
    // Swing arm towards cursor/aim angle
    const handDist = 22 * scale;
    rHandX = neckX + Math.cos(aimAngle) * handDist;
    rHandY = neckY + Math.sin(aimAngle) * handDist;

    lHandX = neckX + Math.cos(aimAngle + 0.5) * (handDist * 0.7);
    lHandY = neckY + Math.sin(aimAngle + 0.5) * (handDist * 0.7);
  } else if (char.state === 'chase' || char.state === 'patrol') {
    // Swinging arms for running
    rHandX = neckX + stride * 12 * scale;
    rHandY = neckY + 12 * scale + Math.abs(stride) * 3 * scale;

    lHandX = neckX - stride * 12 * scale;
    lHandY = neckY + 12 * scale + Math.abs(stride) * 3 * scale;
  }

  // Draw Left Arm (back) and Right Arm (front)
  drawSketchLine(ctx, neckX, neckY, lHandX, lHandY, stickColor, lineWeight * 0.8, 1.2, `${char.x}-l-arm`);
  drawSketchLine(ctx, neckX, neckY, rHandX, rHandY, stickColor, lineWeight * 0.8, 1.2, `${char.x}-r-arm`);

  // Draw Weapon!
  if (weaponType && char.state !== 'dead') {
    ctx.save();
    // Weapon draws from right hand (pointing outward along aimAngle)
    const angle = aimAngle;
    ctx.translate(rHandX, rHandY);
    ctx.rotate(angle);

    // Dynamic scale for weapon based on boss vs player
    const wScale = scale;

    switch (weaponType) {
      case 'sword': {
        const bladeL = 40 * wScale;
        // Weapon guard
        drawSketchLine(ctx, 0, -6 * wScale, 0, 6 * wScale, accessoryColor, 3, 1, `${char.x}-guard`);
        // Blade
        drawSketchRect(ctx, 0, -2 * wScale, bladeL, 4 * wScale, stickColor, 2, 1, false, undefined, `${char.x}-blade`);
        // Highlight interior pencil shading
        drawSketchLine(ctx, 2, 0, bladeL - 4 * wScale, 0, accessoryColor, 1.5, 0.8, `${char.x}-bladecore`);
        break;
      }
      case 'hammer': {
        const handleL = 35 * wScale;
        const blockW = 16 * wScale;
        const blockH = 26 * wScale;
        // Handle shaft
        drawSketchLine(ctx, -10 * wScale, 0, handleL, 0, stickColor, 3, 1, `${char.x}-shaft`);
        // Giant steel hammer head
        drawSketchRect(ctx, handleL, -blockH / 2, blockW, blockH, stickColor, 3, 1.1, true, undefined, `${char.x}-hammerhead`);
        // Highlight cross hatch details
        drawSketchLine(ctx, handleL + 4 * wScale, -blockH / 3, handleL + 4 * wScale, blockH / 3, accessoryColor, 2, 1, `${char.x}-h-det-1`);
        drawSketchLine(ctx, handleL + 12 * wScale, -blockH / 3, handleL + 12 * wScale, blockH / 3, accessoryColor, 2, 1, `${char.x}-h-det-2`);
        break;
      }
      case 'spear': {
        const spearL = 60 * wScale;
        const tipL = 14 * wScale;
        // Shaft
        drawSketchLine(ctx, -15 * wScale, 0, spearL, 0, stickColor, 2.5, 1, `${char.x}-shaft`);
        // Triangle Tip
        ctx.beginPath();
        ctx.moveTo(spearL, -5 * wScale);
        ctx.lineTo(spearL + tipL, 0);
        ctx.lineTo(spearL, 5 * wScale);
        ctx.closePath();
        ctx.strokeStyle = stickColor;
        ctx.fillStyle = accessoryColor;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'scythe': {
        const shaftL = 50 * wScale;
        const bladeCurve = 35 * wScale;
        // Wooden frame handle
        drawSketchLine(ctx, -10 * wScale, 0, shaftL, 0, stickColor, 3, 1.1, `${char.x}-scythe-shaft`);
        // Curved scary dark reaper blade
        ctx.save();
        ctx.translate(shaftL, 0);
        ctx.rotate(1.8); // Curved forward
        // Sketchy blade
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(bladeCurve * 0.5, -bladeCurve * 0.2, bladeCurve, -10 * wScale);
        ctx.quadraticCurveTo(bladeCurve * 0.6, 5 * wScale, 0, 0);
        ctx.closePath();
        ctx.fillStyle = accessoryColor;
        ctx.strokeStyle = stickColor;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'fists': {
        // Simple boxing sketchy outline on knuckles
        drawSketchCircle(ctx, 4 * wScale, 0, 5 * wScale, accessoryColor, 2, 1.1, true, accessoryColor, `${char.x}-fist`);
        break;
      }
    }
    ctx.restore();
  }

  // Draw Specific Enemy Hand Accessories if not holding above weapon
  if (char.type === 'shield' && char.state !== 'dead') {
    // Large heavy wood shield in left hand representation
    const sAngle = char.isFacingLeft ? Math.PI * 0.8 : Math.PI * 0.2;
    ctx.save();
    ctx.translate(lHandX, lHandY);
    ctx.rotate(sAngle);
    // Draw thick sketchy shield plate
    drawSketchRect(ctx, -6, -20, 12, 40, stickColor, 3, 1.2, true, undefined, `${char.x}-woodshield`);
    // Blue details inside
    drawSketchLine(ctx, -3, -15, -3, 15, '#1e3a8a', 2, 1, `${char.x}-sh-1`);
    drawSketchLine(ctx, 3, -15, 3, 15, '#1e3a8a', 2, 1, `${char.x}-sh-2`);
    ctx.restore();
  }

  if (char.type === 'archer' && char.state !== 'dead') {
    // Draw wood bow
    ctx.save();
    ctx.translate(rHandX, rHandY);
    ctx.rotate(aimAngle);
    // Upper string, lower string, curved limb
    ctx.beginPath();
    ctx.arc(0, 0, 15, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = stickColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Bowstring line
    drawSketchLine(ctx, 0, -15, 0, 15, '#999999', 1, 0.8, `${char.x}-bowstring`);
    ctx.restore();
  }

  // Draw Health Bar above head for Enemies / Bosses
  if (char.health < char.maxHealth && char.state !== 'dead') {
    const barW = char.type === 'boss' ? 120 : 36;
    const barH = char.type === 'boss' ? 8 : 4;
    const barX = char.x - barW / 2;
    const barY = headY - 18;

    // Outer background
    ctx.save();
    ctx.fillStyle = '#fee2e2'; // Light-red
    ctx.fillRect(barX, barY, barW, barH);

    // Active health
    const ratio = Math.max(0, char.health / char.maxHealth);
    ctx.fillStyle = '#ef4444'; // Red block
    ctx.fillRect(barX, barY, barW * ratio, barH);
    
    // Draw a quick black sketchy outline around the health bar
    drawSketchRect(ctx, barX, barY, barW, barH, '#374151', 1, 0.5, false, undefined, `${char.x}-hpbar-outline`);
    ctx.restore();
  }
}

// Draw game background grids to simulate pencil/journal blueprint paper
export function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number,
  isExtremeShaking: boolean
) {
  ctx.save();
  // Clear with off-white warm workbook page color corresponding to Immersive UI
  ctx.fillStyle = '#E8E4D9';
  ctx.fillRect(0, 0, width, height);

  // Faint blue ledger vertical grids spaced by 40px
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;

  const startX = -(cameraX % 40);
  for (let x = startX; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal typewriter spacing
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Sketchy red double margin line as in legal-ruled paper
  const marginX0 = 150 - cameraX;
  if (marginX0 < width && marginX0 > -10) {
    drawSketchLine(ctx, marginX0, 0, marginX0, height, 'rgba(185, 28, 28, 0.25)', 2.5, 0.8, 'margin-line-1');
    drawSketchLine(ctx, marginX0 + 4, 0, marginX0 + 4, height, 'rgba(185, 28, 28, 0.25)', 2.5, 0.8, 'margin-line-2');
  }

  ctx.restore();
}

// Draw platforms with cross hatching and notebook-style labels
export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  plat: Platform,
  cameraX: number
) {
  const rx = plat.x - cameraX;
  const ry = plat.y;
  const rw = plat.w;
  const rh = plat.h;

  let platColor = '#1f2937'; // Slate charcoal
  let hatchColor = 'rgba(31, 41, 55, 0.08)';
  let label = '';

  switch (plat.type) {
    case 'floor':
      platColor = '#111827';
      label = '=== SCRATCHPAD HORIZON ===';
      break;
    case 'hazard':
      platColor = '#b91c1c'; // Dangerous blood ink
      hatchColor = 'rgba(185, 28, 28, 0.15)';
      label = '[ SPIKES: AVOID! ]';
      break;
    case 'trampoline':
      platColor = '#059669'; // Bouncy emerald elastic green
      hatchColor = 'rgba(5, 150, 105, 0.15)';
      label = '(( BOUNCER ))';
      break;
    case 'eraser':
      platColor = '#ca8a04'; // Eraser dusty yellow
      hatchColor = 'rgba(202, 138, 4, 0.15)';
      label = '< ERASER PLANK >';
      break;
    case 'platform':
      platColor = '#374151';
      break;
  }

  // Draw platform outline
  drawSketchRect(ctx, rx, ry, rw, rh, platColor, 2.5, 1.2, true, undefined, `plat-${plat.id}`);

  // Draw dense pencil cross-hatching
  ctx.save();
  ctx.strokeStyle = hatchColor;
  ctx.lineWidth = 1.5;
  const hSpacing = 16;
  const hatchLimit = Math.min(600, rw); // performance guard for massive infinite floors
  
  for (let o = 6; o < hatchLimit; o += hSpacing) {
    drawSketchLine(
      ctx,
      rx + o,
      ry,
      rx + Math.max(0, o - rh),
      ry + Math.min(rh, o),
      hatchColor,
      1,
      0.6,
      `plat-hatch-${plat.id}-${o}`
    );
  }
  ctx.restore();

  // Draw text annotation in cute handwriting
  if (label && rw > 120) {
    ctx.save();
    ctx.fillStyle = plat.type === 'hazard' ? '#ef4444' : 'rgba(31, 41, 55, 0.3)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, rx + rw / 2, ry + rh / 2 + 3);
    ctx.restore();
  }
}

// Draw combat effects, abilities, projectiles
export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  cameraX: number
) {
  const rx = proj.x - cameraX;
  const ry = proj.y;

  ctx.save();
  if (proj.type === 'arrow') {
    const angle = proj.angle || Math.atan2(proj.vy, proj.vx);
    ctx.translate(rx, ry);
    ctx.rotate(angle);
    // Draw sketchy wood arrow
    drawSketchLine(ctx, -14, 0, 10, 0, '#4b5563', 2, 0.8, `${proj.id}-arrowshaft`);
    drawSketchLine(ctx, 10, 0, 3, -4, '#10b981', 1.5, 0.5, `${proj.id}-arrowtip-t`);
    drawSketchLine(ctx, 10, 0, 3, 4, '#10b981', 1.5, 0.5, `${proj.id}-arrowtip-b`);
    // Fletching (feathers)
    drawSketchLine(ctx, -12, 0, -16, -4, '#ef4444', 1.5, 0.5, `${proj.id}-arrowfletch-l`);
    drawSketchLine(ctx, -12, 0, -16, 4, '#ef4444', 1.5, 0.5, `${proj.id}-arrowfletch-r`);
  } else if (proj.type === 'inkball') {
    // Dynamic flying ball of charcoal ink!
    drawSketchCircle(ctx, rx, ry, proj.radius, '#1d4ed8', 2, 1.2, true, 'rgba(29, 78, 216, 0.3)', `${proj.id}-inkball`);
    // Tail trail
    const angle = Math.atan2(proj.vy, proj.vx);
    const tx = rx - Math.cos(angle) * 12;
    const ty = ry - Math.sin(angle) * 12;
    drawSketchLine(ctx, rx, ry, tx, ty, '#2563eb', 1.5, 1, `${proj.id}-inktrail`);
  } else if (proj.type === 'shockwave') {
    // Expanding physical ground-slam shockwave
    const angleRad = (proj.life / 10) * Math.PI; // Dynamic bounce
    drawSketchLine(ctx, rx - 15, ry, rx + 15, ry - Math.sin(angleRad) * 20, '#ea580c', 3, 1.5, `${proj.id}-shockwave`);
  }
  ctx.restore();
}

// Draw various types of particles: splats, dust sparks, bubble shields, text floaters
export function drawParticle(
  ctx: CanvasRenderingContext2D,
  part: Particle,
  cameraX: number
) {
  const rx = part.x - cameraX;
  const ry = part.y;

  ctx.save();
  // Apply alpha fade
  ctx.globalAlpha = part.life;

  switch (part.type) {
    case 'ink':
      // Splattered ink blob
      drawSketchCircle(ctx, rx, ry, part.size, part.color, 1.5, 1.4, true, part.color, `part-ink-${part.x}-${part.y}`);
      break;

    case 'spark':
      // Shimmering spark line
      ctx.strokeStyle = part.color;
      ctx.lineWidth = part.size;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      // Lead line using dynamic offset
      ctx.lineTo(rx + part.vx * 3, ry + part.vy * 3);
      ctx.stroke();
      break;

    case 'pencil':
      // Dust/debris circles
      drawSketchCircle(ctx, rx, ry, part.size, part.color, 1, 1.1, true, part.color, `part-penc-${part.x}-${part.y}`);
      break;

    case 'blur':
      // Dash action sketchy afterimage silhouette
      ctx.save();
      // Draw faint blue motion trail
      drawSketchCircle(ctx, rx, ry, 10, 'rgba(59, 130, 246, 0.4)', 2, 1, false, undefined, `part-blur-${part.x}-${part.y}`);
      ctx.restore();
      break;

    case 'bubble':
      // Defensive Ink Shield Bubble
      ctx.save();
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.8)';
      ctx.lineWidth = 2.5;
      // Iridescent sketchy lines around outer border
      drawSketchCircle(ctx, rx, ry, part.size, 'rgba(5, 150, 105, 0.65)', 2, 1.5, true, 'rgba(16, 185, 129, 0.08)', `part-shield-${part.x}-${part.y}`);
      ctx.restore();
      break;

    case 'text':
      // Floating numbers!
      if (part.text) {
        ctx.fillStyle = part.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 2;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(part.text, rx, ry);
      }
      break;
  }
  ctx.restore();
}
