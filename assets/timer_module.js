/**
 * DURATION TIMER TELEMETRY MODULE
 * Terhubung secara modular ke assets/app.js melalui window.overlayRenderHooks
 */

let timerPos = { x: 455, y: 1040 };
let isDraggingTimer = false;
let timerDragOffset = { x: 0, y: 0 };
let timerWaveOffset = 0;
let lastTimerTick = 0;

if (typeof modalTitles !== 'undefined') {
    modalTitles.timer = 'Duration Timer';
}

function hexToRgbaTimer(hex, alpha = 1) {
    hex = (hex || '#f97316').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 249;
    const g = parseInt(hex.substring(2, 4), 16) || 115;
    const b = parseInt(hex.substring(4, 6), 16) || 22;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resetTimerPosition() {
    const ratio = document.getElementById('aspectRatioSelect')?.value || '9:16';
    if (ratio === '9:16') timerPos = { x: 455, y: 1040 };
    else if (ratio === '1:1') timerPos = { x: 760, y: 840 };
    else timerPos = { x: 960, y: 495 };
    renderFrame();
}

// Samakan Style, Font, Opacity & Scale Timer dengan Widget Heart Rate
function syncTimerWithHrStyle() {
    const hrStyle = document.getElementById('hudStyleSelect')?.value;
    const map = {
        'heart_num_side':   'text_pure',
        'heart_num_inside': 'text_pure',
        'dji_ring':         'match_dji_ring',
        'dji_ecg':          'match_dji_wave',
        'apple_fitness':    'match_apple_ring',
        'garmin_arc':       'match_garmin_arc',
        'whoop_strain':     'match_whoop_bar',
        'strava_minimal':   'match_strava_clean',
        'coros_hex':        'match_coros_hex',
        'nike_volt':        'match_nike_volt',
        'polar_beat':       'match_polar_badge',
        'cyber_hud':        'match_cyber_brackets',
        'crossfit_tile':    'match_crossfit_tile',
        'heart_fill':       'match_stopwatch_analog',
        'vertical_meter':   'match_vertical_meter',
        'neon_glow':        'match_neon_box',
        'glass_badge':      'match_glass_capsule'
    };

    if (hrStyle && map[hrStyle]) {
        document.getElementById('timerStyleSelect').value = map[hrStyle];
    }

    const hrFont = document.getElementById('fontFamilySelect')?.value;
    if (hrFont) document.getElementById('timerFontSelect').value = hrFont;

    const hrScale = document.getElementById('hudScale')?.value;
    if (hrScale) {
        document.getElementById('timerScaleSlider').value = hrScale;
        document.getElementById('lblTimerScale').innerText = Math.round(hrScale * 100) + '%';
    }

    const hrOpacity = document.getElementById('bgOpacitySlider')?.value;
    if (hrOpacity !== undefined) {
        document.getElementById('timerOpacitySlider').value = hrOpacity;
        document.getElementById('lblTimerOpacity').innerText = Math.round(hrOpacity * 100) + '%';
    }

    renderFrame();
}

function drawStopwatchGlyph(ctx, cx, cy, r, color, secAngle = Math.PI * 0.4) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - r - 4);
    ctx.lineTo(cx + 4, cy - r - 4);
    ctx.moveTo(cx, cy - r - 4);
    ctx.lineTo(cx, cy - r);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(secAngle) * (r * 0.68), cy - Math.cos(secAngle) * (r * 0.68));
    ctx.stroke();
    ctx.restore();
}

function renderTimerOverlay(ctx) {
    const showCheckbox = document.getElementById('showTimerWidget');
    if (!showCheckbox || !showCheckbox.checked) return;

    const tStyle      = document.getElementById('timerStyleSelect')?.value || 'clean_digital';
    const countMode   = document.getElementById('timerCountMode')?.value || 'count_up';
    const customLabel = (document.getElementById('timerCustomLabel')?.value || 'WORKOUT TIME').toUpperCase();
    const fontFam     = document.getElementById('timerFontSelect')?.value || "'Chakra Petch', sans-serif";
    const digitColor  = document.getElementById('timerTextColorPicker')?.value || '#ffffff';
    const accentColor = document.getElementById('timerAccentColorPicker')?.value || '#f97316';
    const bgOpacity   = parseFloat(document.getElementById('timerOpacitySlider')?.value ?? 0.65);
    const scale       = parseFloat(document.getElementById('timerScaleSlider')?.value || 1.0);

    const workoutElapsedSec  = Math.max(0, currentVideoSec - trimStartTotalSec);
    const workoutMaxDuration = Math.max(10, trimEndTotalSec - trimStartTotalSec);
    const clampedElapsed     = Math.min(workoutElapsedSec, workoutMaxDuration);
    const progressRatio      = Math.min(1, clampedElapsed / workoutMaxDuration);

    const upStr    = formatMMSS(clampedElapsed);
    const downStr  = formatMMSS(Math.max(0, workoutMaxDuration - clampedElapsed));
    const totalStr = formatMMSS(workoutMaxDuration);

    let mainClock = upStr;
    if (countMode === 'count_down') mainClock = downStr;
    else if (countMode === 'with_total') mainClock = `${upStr} / ${totalStr}`;

    const shortClock = (countMode === 'count_down') ? downStr : upStr;
    const pctDone    = Math.min(100, Math.round(progressRatio * 100));
    const secHandAng = ((clampedElapsed % 60) / 60) * Math.PI * 2;

    const now = performance.now();
    if (isPlayingSim && lastTimerTick) {
        timerWaveOffset += ((now - lastTimerTick) / 1000) * 90;
    }
    lastTimerTick = now;

    ctx.save();
    ctx.translate(timerPos.x, timerPos.y);
    ctx.scale(scale, scale);
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 8;

    // --- KELOMPOK A: MINIMAL / TEXT-ONLY ---
    if (tStyle === 'text_pure') {
        ctx.fillStyle = digitColor;
        ctx.font = `900 62px ${fontFam}`;
        ctx.fillText(mainClock, 0, 58);

    } else if (tStyle === 'clean_digital') {
        ctx.fillStyle = accentColor;
        ctx.font = `800 13px ${fontFam}`;
        ctx.fillText(customLabel, 0, 18);
        ctx.fillStyle = digitColor;
        ctx.font = `900 54px ${fontFam}`;
        ctx.fillText(mainClock, 0, 68);

    } else if (tStyle === 'text_slash_total') {
        drawStopwatchGlyph(ctx, 18, 36, 15, accentColor, secHandAng);
        ctx.fillStyle = digitColor;
        ctx.font = `900 44px ${fontFam}`;
        ctx.fillText(shortClock, 44, 52);
        const w1 = ctx.measureText(shortClock).width;
        ctx.fillStyle = '#94a3b8';
        ctx.font = `700 32px ${fontFam}`;
        ctx.fillText(` / ${totalStr}`, 44 + w1 + 4, 50);

        const barW = Math.max(220, 44 + w1 + ctx.measureText(` / ${totalStr}`).width);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath(); ctx.roundRect(4, 66, barW, 7, 4); ctx.fill();
        ctx.fillStyle = accentColor;
        ctx.beginPath(); ctx.roundRect(4, 66, Math.max(8, barW * progressRatio), 7, 4); ctx.fill();

    } else if (tStyle === 'text_outline') {
        ctx.font = `900 64px ${fontFam}`;
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = accentColor;
        ctx.strokeText(mainClock, 0, 60);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fillText(mainClock, 0, 60);

    } else if (tStyle === 'text_neon') {
        ctx.save();
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = digitColor;
        ctx.font = `900 60px ${fontFam}`;
        ctx.fillText(mainClock, 0, 58);
        ctx.restore();
        ctx.fillStyle = accentColor;
        ctx.font = `800 13px ${fontFam}`;
        ctx.fillText(`// ${pctDone}% COMPLETED`, 2, 78);

    } else if (tStyle === 'text_stacked') {
        const parts = shortClock.split(':');
        ctx.fillStyle = accentColor;
        ctx.fillRect(0, 4, 6, 108);
        ctx.fillStyle = digitColor;
        ctx.font = `900 54px ${fontFam}`;
        ctx.fillText(parts[0] || '00', 16, 50);
        ctx.fillStyle = accentColor;
        ctx.font = `900 54px ${fontFam}`;
        ctx.fillText(parts[1] || '00', 16, 106);
        ctx.fillStyle = '#94a3b8';
        ctx.font = `700 12px ${fontFam}`;
        ctx.fillText('MIN', 92, 34);
        ctx.fillText('SEC', 92, 90);

    // --- KELOMPOK B: TELEMETRY MATCHED ---
    } else if (tStyle === 'match_dji_ring') {
        const r = 74, cx = 82, cy = 82;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(10, 15, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();
        }
        const sAng = Math.PI * 0.75, eAng = Math.PI * 2.25, tot = eAng - sAng;
        ctx.beginPath(); ctx.arc(cx, cy, r, sAng, eAng);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, r, sAng, sAng + tot * Math.max(0.02, progressRatio));
        ctx.strokeStyle = accentColor; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke();

        drawStopwatchGlyph(ctx, cx, cy - 38, 11, accentColor, secHandAng);
        ctx.textAlign = 'center';
        ctx.fillStyle = digitColor; ctx.font = `900 36px ${fontFam}`; ctx.fillText(shortClock, cx, cy + 10);
        ctx.fillStyle = '#cbd5e1'; ctx.font = `700 12px ${fontFam}`; ctx.fillText('TIME', cx, cy + 28);
        ctx.fillStyle = accentColor; ctx.font = `800 12px ${fontFam}`; ctx.fillText(`${pctDone}% DONE`, cx, cy + 58);
        ctx.textAlign = 'left';

    } else if (tStyle === 'match_dji_wave') {
        const w = 235, h = 125;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(10, 15, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, w, h, 14); ctx.fill();
        }
        drawStopwatchGlyph(ctx, 28, 36, 13, accentColor, secHandAng);
        ctx.fillStyle = digitColor; ctx.font = `900 44px ${fontFam}`; ctx.fillText(shortClock, 50, 52);
        ctx.fillStyle = accentColor; ctx.font = `700 13px ${fontFam}`; ctx.fillText(`${pctDone}%`, 178, 46);

        ctx.beginPath();
        for (let x = 0; x < 195; x += 3) {
            const yo = Math.sin((x + timerWaveOffset) * 0.08) * 10;
            if (x === 0) ctx.moveTo(20 + x, 92 + yo); else ctx.lineTo(20 + x, 92 + yo);
        }
        ctx.strokeStyle = accentColor; ctx.lineWidth = 2.5; ctx.stroke();

    } else if (tStyle === 'match_apple_ring') {
        const w = 235, h = 100;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(14, 18, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, w, h, 24); ctx.fill();
        }
        const cx = 50, cy = 50, r = 30;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 9; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progressRatio));
        ctx.strokeStyle = accentColor; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();

        drawStopwatchGlyph(ctx, cx, cy + 2, 11, accentColor, secHandAng);
        ctx.fillStyle = digitColor; ctx.font = `900 40px ${fontFam}`; ctx.fillText(shortClock, 94, 54);
        ctx.fillStyle = accentColor; ctx.font = `800 12px ${fontFam}`; ctx.fillText(`TOTAL ${totalStr}`, 94, 76);

    } else if (tStyle === 'match_garmin_arc') {
        const cx = 105, cy = 105, r = 78;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(10, 15, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(10, 15, 190, 135, 18); ctx.fill();
        }
        const activeSeg = Math.ceil(progressRatio * 5);
        const zCols = ['#38bdf8', '#22c55e', '#eab308', '#f97316', '#ef4444'];
        for (let z = 0; z < 5; z++) {
            const a1 = Math.PI + (z * 0.2 * Math.PI) + 0.03;
            const a2 = Math.PI + ((z + 1) * 0.2 * Math.PI) - 0.03;
            ctx.beginPath(); ctx.arc(cx, cy, r, a1, a2);
            ctx.strokeStyle = (z + 1 <= activeSeg) ? zCols[z] : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = (z + 1 === activeSeg) ? 14 : 9;
            ctx.stroke();
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = digitColor; ctx.font = `900 42px ${fontFam}`; ctx.fillText(shortClock, cx, cy + 2);
        ctx.fillStyle = accentColor; ctx.font = `800 13px ${fontFam}`; ctx.fillText(`${pctDone}% TIME`, cx, cy + 26);
        ctx.textAlign = 'left';

    } else if (tStyle === 'match_whoop_bar') {
        const w = 220, h = 95;
        if (bgOpacity > 0.02) { ctx.fillStyle = `rgba(12, 16, 24, ${bgOpacity})`; ctx.fillRect(0, 0, w, h); }
        ctx.fillStyle = digitColor; ctx.font = `900 42px ${fontFam}`; ctx.fillText(shortClock, 16, 50);
        ctx.fillStyle = accentColor; ctx.font = `800 13px ${fontFam}`; ctx.fillText(`${pctDone}%`, 145, 34);
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 11px ${fontFam}`; ctx.fillText(`/${totalStr}`, 145, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(16, 68, w - 32, 10);
        ctx.fillStyle = accentColor; ctx.fillRect(16, 68, (w - 32) * progressRatio, 10);

    } else if (tStyle === 'match_strava_clean') {
        ctx.fillStyle = accentColor; ctx.fillRect(0, 8, 6, 78);
        ctx.fillStyle = '#cbd5e1'; ctx.font = `800 13px ${fontFam}`; ctx.fillText(customLabel, 18, 22);
        ctx.fillStyle = digitColor; ctx.font = `900 54px ${fontFam}`; ctx.fillText(shortClock, 16, 74);

    } else if (tStyle === 'match_coros_hex') {
        const cx = 90, cy = 80, r = 72;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const ang = (Math.PI / 3) * i - Math.PI / 6;
            const hx = cx + r * Math.cos(ang), hy = cy + r * Math.sin(ang);
            if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        if (bgOpacity > 0.02) { ctx.fillStyle = `rgba(12, 19, 32, ${bgOpacity})`; ctx.fill(); }
        ctx.strokeStyle = accentColor; ctx.lineWidth = 4; ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = accentColor; ctx.font = `800 12px ${fontFam}`; ctx.fillText('TIMER', cx, cy - 24);
        ctx.fillStyle = digitColor; ctx.font = `900 36px ${fontFam}`; ctx.fillText(shortClock, cx, cy + 12);
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 11px ${fontFam}`; ctx.fillText(`${pctDone}%`, cx, cy + 34);
        ctx.textAlign = 'left';

    } else if (tStyle === 'match_nike_volt') {
        const w = 225, h = 92;
        ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(w, 0); ctx.lineTo(w - 14, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = `rgba(10, 12, 16, ${Math.max(0.75, bgOpacity)})`; ctx.fill();
        ctx.fillStyle = '#d4ff00';
        ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(26, 0); ctx.lineTo(12, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#d4ff00'; ctx.font = `900 13px ${fontFam}`; ctx.fillText(`${customLabel} // ${pctDone}%`, 34, 26);
        ctx.fillStyle = digitColor; ctx.font = `900 48px ${fontFam}`; ctx.fillText(shortClock, 32, 76);

    } else if (tStyle === 'match_polar_badge') {
        const w = 185, h = 110;
        ctx.fillStyle = '#d90429';
        ctx.beginPath(); ctx.roundRect(0, 0, w, 30, [12, 12, 0, 0]); ctx.fill();
        ctx.fillStyle = `rgba(15, 20, 30, ${Math.max(0.7, bgOpacity)})`;
        ctx.beginPath(); ctx.roundRect(0, 30, w, h - 30, [0, 0, 12, 12]); ctx.fill();

        ctx.fillStyle = '#ffffff'; ctx.font = `800 13px ${fontFam}`; ctx.fillText(customLabel, 14, 20);
        ctx.fillStyle = digitColor; ctx.font = `900 46px ${fontFam}`; ctx.fillText(shortClock, 18, 84);

    } else if (tStyle === 'match_cyber_brackets') {
        const w = 215, h = 95;
        if (bgOpacity > 0.02) { ctx.fillStyle = `rgba(8, 16, 28, ${bgOpacity})`; ctx.fillRect(0, 0, w, h); }
        ctx.strokeStyle = '#00f5d4'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20); ctx.lineTo(0, 0); ctx.lineTo(20, 0);
        ctx.moveTo(w - 20, 0); ctx.lineTo(w, 0); ctx.lineTo(w, 20);
        ctx.moveTo(0, h - 20); ctx.lineTo(0, h); ctx.lineTo(20, h);
        ctx.moveTo(w - 20, h); ctx.lineTo(w, h); ctx.lineTo(w, h - 20);
        ctx.stroke();

        ctx.fillStyle = '#00f5d4'; ctx.font = `700 12px ${fontFam}`; ctx.fillText(`SYS.TIME // ${pctDone}%`, 16, 24);
        ctx.fillStyle = digitColor; ctx.font = `900 44px ${fontFam}`; ctx.fillText(shortClock, 16, 74);

    } else if (tStyle === 'match_crossfit_tile') {
        const w = 165, h = 120;
        ctx.fillStyle = `rgba(18, 22, 28, ${Math.max(0.75, bgOpacity)})`; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = accentColor; ctx.fillRect(0, 0, w, 6);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8'; ctx.font = `800 13px ${fontFam}`; ctx.fillText(customLabel, w/2, 28);
        ctx.fillStyle = digitColor; ctx.font = `900 46px ${fontFam}`; ctx.fillText(shortClock, w/2, 78);
        ctx.fillStyle = accentColor; ctx.font = `800 12px ${fontFam}`; ctx.fillText(`TARGET ${totalStr}`, w/2, 106);
        ctx.textAlign = 'left';

    } else if (tStyle === 'match_stopwatch_analog') {
        const cx = 65, cy = 65, r = 52;
        ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0.6, bgOpacity)})`;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = accentColor; ctx.lineWidth = 4; ctx.stroke();

        ctx.fillStyle = hexToRgbaTimer(accentColor, 0.35);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r - 4, -Math.PI/2, -Math.PI/2 + secHandAng); ctx.closePath(); ctx.fill();

        ctx.textAlign = 'center';
        ctx.fillStyle = digitColor; ctx.font = `900 32px ${fontFam}`; ctx.fillText(shortClock, cx, cy + 10);
        ctx.font = `800 11px ${fontFam}`; ctx.fillText('TIME', cx, cy + 28);
        ctx.textAlign = 'left';

    } else if (tStyle === 'match_vertical_meter') {
        const barH = 135;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(12, 18, 28, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, 185, barH + 20, 12); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(16, 10, 12, barH);
        const fillH = barH * progressRatio;
        ctx.fillStyle = accentColor; ctx.fillRect(16, 10 + (barH - fillH), 12, fillH);

        ctx.fillStyle = digitColor; ctx.font = `900 42px ${fontFam}`; ctx.fillText(shortClock, 40, 72);
        ctx.fillStyle = accentColor; ctx.font = `800 14px ${fontFam}`; ctx.fillText(`${pctDone}%`, 40, 96);
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 12px ${fontFam}`; ctx.fillText(`/${totalStr}`, 40, 118);

    } else if (tStyle === 'match_neon_box') {
        const w = 215, h = 90;
        ctx.save();
        ctx.shadowColor = accentColor; ctx.shadowBlur = 18;
        ctx.strokeStyle = accentColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.stroke();
        ctx.fillStyle = digitColor; ctx.font = `900 46px ${fontFam}`; ctx.fillText(shortClock, 22, 60);
        ctx.restore();
        ctx.fillStyle = accentColor; ctx.font = `800 13px ${fontFam}`; ctx.fillText('TIME', 162, 58);

    } else if (tStyle === 'match_glass_capsule') {
        const w = 220, h = 82;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(15, 23, 42, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, w, h, 41); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
        }
        drawStopwatchGlyph(ctx, 36, 42, 15, accentColor, secHandAng);
        ctx.fillStyle = digitColor; ctx.font = `900 40px ${fontFam}`; ctx.fillText(shortClock, 64, 54);
        ctx.fillStyle = accentColor; ctx.font = `700 12px ${fontFam}`; ctx.fillText(`${pctDone}%`, 175, 50);

    // --- KELOMPOK C: BROADCAST & SCOREBOARD ---
    } else if (tStyle === 'dji_pill') {
        const w = 215, h = 88;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(10, 15, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, w, h, 20); ctx.fill();
        }
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 12px ${fontFam}`; ctx.fillText(customLabel, 20, 24);
        ctx.fillStyle = digitColor; ctx.font = `900 42px ${fontFam}`; ctx.fillText(shortClock, 20, 64);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(20, 74, w - 40, 5);
        ctx.fillStyle = accentColor; ctx.fillRect(20, 74, (w - 40) * progressRatio, 5);

    } else if (tStyle === 'broadcast_tag') {
        const w = 200, h = 82;
        ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0.7, bgOpacity)})`; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = accentColor; ctx.fillRect(0, 0, 6, h);
        ctx.fillStyle = accentColor; ctx.font = `800 12px ${fontFam}`; ctx.fillText(customLabel, 18, 24);
        ctx.fillStyle = digitColor; ctx.font = `900 44px ${fontFam}`; ctx.fillText(shortClock, 18, 68);

    } else {
        const chars = shortClock.split('');
        let cxOff = 0;
        chars.forEach(ch => {
            if (ch === ':') {
                ctx.fillStyle = accentColor; ctx.font = `900 44px ${fontFam}`;
                ctx.fillText(':', cxOff + 4, 52);
                cxOff += 20;
            } else {
                ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0.8, bgOpacity)})`;
                ctx.beginPath(); ctx.roundRect(cxOff, 6, 40, 60, 8); ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.textAlign = 'center';
                ctx.fillStyle = digitColor; ctx.font = `900 44px ${fontFam}`;
                ctx.fillText(ch, cxOff + 20, 52);
                ctx.textAlign = 'left';
                cxOff += 45;
            }
        });
    }

    ctx.restore();
}

// Daftarkan fungsi render ke dalam Hook Utama app.js
window.overlayRenderHooks.push(renderTimerOverlay);

// Drag & Drop Posisi Widget Timer di Kanvas
canvas.addEventListener('mousedown', function(e) {
    if (!document.getElementById('showTimerWidget')?.checked) return;
    if (typeof isDraggingHr !== 'undefined' && isDraggingHr) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (Math.hypot(mx - (timerPos.x + 90), my - (timerPos.y + 45)) < 110) {
        isDraggingTimer = true;
        timerDragOffset = { x: mx - timerPos.x, y: my - timerPos.y };
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isDraggingTimer) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    timerPos = { x: mx - timerDragOffset.x, y: my - timerDragOffset.y };
    renderFrame();
});

window.addEventListener('mouseup', () => { isDraggingTimer = false; });