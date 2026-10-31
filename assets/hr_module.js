/**
 * HEART RATE TELEMETRY MODULE
 * Terhubung secara modular ke assets/app.js melalui window.overlayRenderHooks
 */

let hrValues = [];
let hrIntervalSec = 5;
let hrPos = { x: 44, y: 1040 };
let pulsePhase = 0;
let ecgOffset = 0;
let lastHrTick = 0;

let isDraggingHr = false;
let hrDragOffset = { x: 0, y: 0 };

// Daftarkan judul inspector untuk tab HR
if (typeof modalTitles !== 'undefined') {
    modalTitles.hr = 'Heart Rate Telemetry';
}

function resetHrPosition() {
    const ratio = document.getElementById('aspectRatioSelect')?.value || '9:16';
    if (ratio === '9:16') hrPos = { x: 44, y: 1040 };
    else if (ratio === '1:1') hrPos = { x: 45, y: 840 };
    else hrPos = { x: 48, y: 495 };
    renderFrame();
}

function parseHrInput() {
    const raw = document.getElementById('hrDataInput')?.value || '';
    const nums = raw.split(/[\s,;]+/).map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v) && v >= 35 && v <= 240);
    hrValues = nums.length > 0 ? nums : [142];
    const lblCount = document.getElementById('lblHrCount');
    if (lblCount) lblCount.innerText = `${hrValues.length} pts`;
    renderFrame();
}

function generateSampleHr() {
    const workoutLen = Math.max(60, trimEndTotalSec - trimStartTotalSec);
    const totalPoints = Math.ceil(workoutLen / hrIntervalSec);
    const sample = [];
    for (let i = 0; i < totalPoints; i++) {
        const p = i / totalPoints;
        const bpm = 118 + Math.sin(i * 0.35) * 14 + (p * 32);
        sample.push(Math.min(185, Math.round(bpm)));
    }
    const input = document.getElementById('hrDataInput');
    if (input) {
        input.value = sample.join(', ');
        parseHrInput();
    }
}

function getZoneInfo(bpm) {
    const maxHr = 192;
    const pct = Math.min(100, Math.round((bpm / maxHr) * 100));
    if (pct >= 90) return { zone: 5, name: 'ZONE 5 • MAX', short: 'MAX', color: '#ef4444', pct, ratio: Math.min(1, bpm / maxHr) };
    if (pct >= 80) return { zone: 4, name: 'ZONE 4 • ANAEROBIC', short: 'ANAEROBIC', color: '#f97316', pct, ratio: bpm / maxHr };
    if (pct >= 70) return { zone: 3, name: 'ZONE 3 • AEROBIC', short: 'AEROBIC', color: '#eab308', pct, ratio: bpm / maxHr };
    if (pct >= 60) return { zone: 2, name: 'ZONE 2 • FAT BURN', short: 'FAT BURN', color: '#22c55e', pct, ratio: bpm / maxHr };
    return { zone: 1, name: 'ZONE 1 • WARM UP', short: 'WARM UP', color: '#38bdf8', pct, ratio: Math.max(0.25, bpm / maxHr) };
}

function drawHeartVector(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const t = size * 0.3;
    ctx.moveTo(cx, cy + t);
    ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + t);
    ctx.bezierCurveTo(cx - size / 2, cy + (size + t) / 2, cx, cy + (size + t) / 1.8, cx, cy + size);
    ctx.bezierCurveTo(cx, cy + (size + t) / 1.8, cx + size / 2, cy + (size + t) / 2, cx + size / 2, cy + t);
    ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + t);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Fungsi Render 17 Style Heart Rate
function renderHrOverlay(ctx) {
    const showCheckbox = document.getElementById('showHrWidget');
    if (!showCheckbox || !showCheckbox.checked) return;

    const style       = document.getElementById('hudStyleSelect')?.value || 'heart_num_side';
    const fontFam     = document.getElementById('fontFamilySelect')?.value || "'Chakra Petch', sans-serif";
    const heartColor  = document.getElementById('heartColorPicker')?.value || '#ef4444';
    const accentColor = document.getElementById('accentColorPicker')?.value || '#f97316';
    const bgOpacity   = parseFloat(document.getElementById('bgOpacitySlider')?.value ?? 0.65);
    const scale       = parseFloat(document.getElementById('hudScale')?.value || 1.0);

    const workoutElapsedSec = Math.max(0, currentVideoSec - trimStartTotalSec);
    const hrIndex = Math.floor(workoutElapsedSec / hrIntervalSec);
    const bpm = hrValues[hrIndex % Math.max(1, hrValues.length)] || 142;
    const zInfo = getZoneInfo(bpm);

    // Update animasi detak jantung saat video diputar
    const now = performance.now();
    if (isPlayingSim && lastHrTick) {
        const dt = (now - lastHrTick) / 1000;
        pulsePhase += dt * (bpm / 60) * Math.PI * 2;
        ecgOffset  += dt * 90;
    }
    lastHrTick = now;
    const beatScale = isPlayingSim ? (1 + Math.sin(pulsePhase) * 0.07) : 1.0;

    ctx.save();
    ctx.translate(hrPos.x, hrPos.y);
    ctx.scale(scale, scale);
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 8;

    if (style === 'heart_num_side') {
        // 01: Hanya Gambar Heart + Angka Saja di Samping
        ctx.save();
        ctx.translate(32, 38);
        ctx.scale(beatScale, beatScale);
        drawHeartVector(ctx, 0, -22, 48, heartColor);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 66px ${fontFam}`;
        ctx.fillText(String(bpm), 68, 62);

    } else if (style === 'heart_num_inside') {
        // 02: Hanya Gambar Heart Besar + Angka di Dalam Hati
        ctx.save();
        ctx.translate(68, 12);
        ctx.scale(beatScale, beatScale);
        drawHeartVector(ctx, 0, 0, 108, heartColor);
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 44px ${fontFam}`;
        ctx.fillText(String(bpm), 68, 78);
        ctx.textAlign = 'left';

    } else if (style === 'dji_ring') {
        const r = 74, cx = 82, cy = 82;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(10, 15, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();
        }
        const sAng = Math.PI * 0.75, eAng = Math.PI * 2.25, tot = eAng - sAng;
        ctx.beginPath(); ctx.arc(cx, cy, r, sAng, eAng);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, r, sAng, sAng + tot * Math.min(1, zInfo.ratio));
        ctx.strokeStyle = heartColor; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke();

        ctx.textAlign = 'center';
        ctx.save(); ctx.translate(cx, cy - 36); ctx.scale(beatScale, beatScale);
        drawHeartVector(ctx, 0, -10, 22, heartColor); ctx.restore();

        ctx.fillStyle = '#ffffff'; ctx.font = `900 44px ${fontFam}`; ctx.fillText(String(bpm), cx, cy + 12);
        ctx.fillStyle = '#cbd5e1'; ctx.font = `700 13px ${fontFam}`; ctx.fillText('BPM', cx, cy + 30);
        ctx.fillStyle = zInfo.color; ctx.font = `800 12px ${fontFam}`; ctx.fillText(`Z${zInfo.zone} ${zInfo.short}`, cx, cy + 60);
        ctx.textAlign = 'left';

    } else if (style === 'dji_ecg') {
        const w = 235, h = 125;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(10, 15, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, w, h, 14); ctx.fill();
        }
        ctx.save(); ctx.translate(30, 36); ctx.scale(beatScale, beatScale);
        drawHeartVector(ctx, 0, -12, 26, heartColor); ctx.restore();

        ctx.fillStyle = '#ffffff'; ctx.font = `900 48px ${fontFam}`; ctx.fillText(String(bpm), 54, 52);
        ctx.fillStyle = zInfo.color; ctx.font = `700 14px ${fontFam}`; ctx.fillText(`BPM • Z${zInfo.zone}`, 142, 46);

        ctx.beginPath();
        for (let x = 0; x < 195; x += 3) {
            const ph = (x + ecgOffset) % 60;
            const yo = (ph > 25 && ph < 30) ? -20 : (ph >= 30 && ph < 35 ? 12 : 0);
            if (x === 0) ctx.moveTo(20 + x, 92 + yo); else ctx.lineTo(20 + x, 92 + yo);
        }
        ctx.strokeStyle = heartColor; ctx.lineWidth = 2.5; ctx.stroke();

    } else if (style === 'apple_fitness') {
        const w = 230, h = 100;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(14, 18, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, w, h, 24); ctx.fill();
        }
        const cx = 50, cy = 50, r = 30;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,42,75,0.25)'; ctx.lineWidth = 9; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + (Math.PI*2 * zInfo.ratio));
        ctx.strokeStyle = heartColor; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();

        ctx.save(); ctx.translate(cx, cy + 2); ctx.scale(beatScale, beatScale);
        drawHeartVector(ctx, 0, -10, 20, heartColor); ctx.restore();

        ctx.fillStyle = '#ffffff'; ctx.font = `900 44px ${fontFam}`; ctx.fillText(`${bpm}`, 96, 56);
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 14px ${fontFam}`; ctx.fillText('BPM', 178, 54);
        ctx.fillStyle = zInfo.color; ctx.font = `800 12px ${fontFam}`; ctx.fillText(zInfo.name, 96, 78);

    } else if (style === 'garmin_arc') {
        const cx = 105, cy = 105, r = 78;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(10, 15, 26, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(10, 15, 190, 135, 18); ctx.fill();
        }
        const zCols = ['#38bdf8', '#22c55e', '#eab308', '#f97316', '#ef4444'];
        for (let z = 0; z < 5; z++) {
            const a1 = Math.PI + (z * 0.2 * Math.PI) + 0.03;
            const a2 = Math.PI + ((z + 1) * 0.2 * Math.PI) - 0.03;
            ctx.beginPath(); ctx.arc(cx, cy, r, a1, a2);
            ctx.strokeStyle = (z + 1 <= zInfo.zone) ? zCols[z] : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = (z + 1 === zInfo.zone) ? 14 : 9;
            ctx.stroke();
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff'; ctx.font = `900 48px ${fontFam}`; ctx.fillText(`${bpm}`, cx, cy + 2);
        ctx.fillStyle = zInfo.color; ctx.font = `800 13px ${fontFam}`; ctx.fillText(`♥ ${zInfo.short}`, cx, cy + 26);
        ctx.textAlign = 'left';

    } else if (style === 'whoop_strain') {
        const w = 220, h = 95;
        if (bgOpacity > 0.02) { ctx.fillStyle = `rgba(12, 16, 24, ${bgOpacity})`; ctx.fillRect(0, 0, w, h); }
        ctx.fillStyle = '#ffffff'; ctx.font = `900 46px ${fontFam}`; ctx.fillText(`${bpm}`, 16, 50);
        ctx.fillStyle = heartColor; ctx.font = `800 14px ${fontFam}`; ctx.fillText(`♥ ${zInfo.pct}% MAX`, 105, 34);
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 12px ${fontFam}`; ctx.fillText(zInfo.short, 105, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(16, 68, w - 32, 10);
        ctx.fillStyle = zInfo.color; ctx.fillRect(16, 68, (w - 32) * zInfo.ratio, 10);

    } else if (style === 'strava_minimal') {
        ctx.fillStyle = '#fc4c02'; ctx.fillRect(0, 8, 6, 78);
        ctx.fillStyle = '#cbd5e1'; ctx.font = `800 13px ${fontFam}`; ctx.fillText('HEART RATE', 18, 22);
        ctx.fillStyle = '#ffffff'; ctx.font = `900 58px ${fontFam}`; ctx.fillText(`${bpm}`, 16, 74);
        const bw = ctx.measureText(`${bpm}`).width;
        ctx.fillStyle = heartColor; ctx.font = `800 18px ${fontFam}`; ctx.fillText('BPM', 22 + bw, 72);

    } else if (style === 'coros_hex') {
        const cx = 90, cy = 80, r = 72;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const ang = (Math.PI / 3) * i - Math.PI / 6;
            const hx = cx + r * Math.cos(ang), hy = cy + r * Math.sin(ang);
            if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        if (bgOpacity > 0.02) { ctx.fillStyle = `rgba(12, 19, 32, ${bgOpacity})`; ctx.fill(); }
        ctx.strokeStyle = zInfo.color; ctx.lineWidth = 4; ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = heartColor; ctx.font = `800 13px ${fontFam}`; ctx.fillText(`♥ Z${zInfo.zone}`, cx, cy - 24);
        ctx.fillStyle = '#ffffff'; ctx.font = `900 44px ${fontFam}`; ctx.fillText(`${bpm}`, cx, cy + 14);
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 12px ${fontFam}`; ctx.fillText('BPM', cx, cy + 34);
        ctx.textAlign = 'left';

    } else if (style === 'nike_volt') {
        const w = 225, h = 92;
        ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(w, 0); ctx.lineTo(w - 14, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = `rgba(10, 12, 16, ${Math.max(0.75, bgOpacity)})`; ctx.fill();
        ctx.fillStyle = '#d4ff00';
        ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(26, 0); ctx.lineTo(12, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#d4ff00'; ctx.font = `900 13px ${fontFam}`; ctx.fillText(`♥ LIVE BPM // Z${zInfo.zone}`, 34, 26);
        ctx.fillStyle = '#ffffff'; ctx.font = `900 52px ${fontFam}`; ctx.fillText(`${bpm}`, 32, 76);

    } else if (style === 'polar_beat') {
        const w = 185, h = 110;
        ctx.fillStyle = '#d90429';
        ctx.beginPath(); ctx.roundRect(0, 0, w, 30, [12, 12, 0, 0]); ctx.fill();
        ctx.fillStyle = `rgba(15, 20, 30, ${Math.max(0.7, bgOpacity)})`;
        ctx.beginPath(); ctx.roundRect(0, 30, w, h - 30, [0, 0, 12, 12]); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = `800 13px ${fontFam}`; ctx.fillText('♥ POLAR HR ZONE ' + zInfo.zone, 14, 20);
        ctx.font = `900 52px ${fontFam}`; ctx.fillText(`${bpm}`, 20, 86);
        ctx.fillStyle = '#94a3b8'; ctx.font = `700 16px ${fontFam}`; ctx.fillText('BPM', 118, 84);

    } else if (style === 'cyber_hud') {
        const w = 215, h = 95;
        if (bgOpacity > 0.02) { ctx.fillStyle = `rgba(8, 16, 28, ${bgOpacity})`; ctx.fillRect(0, 0, w, h); }
        ctx.strokeStyle = '#00f5d4'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20); ctx.lineTo(0, 0); ctx.lineTo(20, 0);
        ctx.moveTo(w - 20, 0); ctx.lineTo(w, 0); ctx.lineTo(w, 20);
        ctx.moveTo(0, h - 20); ctx.lineTo(0, h); ctx.lineTo(20, h);
        ctx.moveTo(w - 20, h); ctx.lineTo(w, h); ctx.lineTo(w, h - 20);
        ctx.stroke();
        ctx.fillStyle = '#00f5d4'; ctx.font = `700 12px ${fontFam}`; ctx.fillText(`SYS.HR // ${zInfo.short}`, 16, 24);
        ctx.fillStyle = '#ffffff'; ctx.font = `900 48px ${fontFam}`; ctx.fillText(`♥ ${bpm}`, 16, 74);

    } else if (style === 'crossfit_tile') {
        const w = 155, h = 120;
        ctx.fillStyle = `rgba(18, 22, 28, ${Math.max(0.75, bgOpacity)})`; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = accentColor; ctx.fillRect(0, 0, w, 6);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8'; ctx.font = `800 13px ${fontFam}`; ctx.fillText('HEART RATE', w/2, 28);
        ctx.fillStyle = '#ffffff'; ctx.font = `900 54px ${fontFam}`; ctx.fillText(`${bpm}`, w/2, 80);
        ctx.fillStyle = zInfo.color; ctx.font = `800 13px ${fontFam}`; ctx.fillText(`♥ BPM (Z${zInfo.zone})`, w/2, 106);
        ctx.textAlign = 'left';

    } else if (style === 'heart_fill') {
        ctx.save(); ctx.translate(65, 20); ctx.scale(beatScale, beatScale);
        drawHeartVector(ctx, 0, 0, 95, 'rgba(255, 42, 75, 0.32)');
        drawHeartVector(ctx, 0, 0, 82, heartColor);
        ctx.restore();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff'; ctx.font = `900 38px ${fontFam}`; ctx.fillText(`${bpm}`, 65, 76);
        ctx.font = `800 12px ${fontFam}`; ctx.fillText('BPM', 65, 94);
        ctx.textAlign = 'left';

    } else if (style === 'vertical_meter') {
        const barH = 135;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(12, 18, 28, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, 175, barH + 20, 12); ctx.fill();
        }
        const grad = ctx.createLinearGradient(0, barH + 10, 0, 10);
        grad.addColorStop(0, '#38bdf8'); grad.addColorStop(0.5, '#eab308'); grad.addColorStop(1, '#ef4444');
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(16, 10, 12, barH);
        const fillH = barH * zInfo.ratio;
        ctx.fillStyle = grad; ctx.fillRect(16, 10 + (barH - fillH), 12, fillH);
        ctx.fillStyle = '#ffffff'; ctx.font = `900 48px ${fontFam}`; ctx.fillText(`${bpm}`, 42, 72);
        ctx.fillStyle = heartColor; ctx.font = `800 15px ${fontFam}`; ctx.fillText('♥ BPM', 42, 96);
        ctx.fillStyle = zInfo.color; ctx.font = `700 12px ${fontFam}`; ctx.fillText(zInfo.short, 42, 118);

    } else if (style === 'neon_glow') {
        const w = 210, h = 90;
        ctx.save();
        ctx.shadowColor = heartColor; ctx.shadowBlur = 18;
        ctx.strokeStyle = heartColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = `900 50px ${fontFam}`; ctx.fillText(`♥ ${bpm}`, 20, 62);
        ctx.restore();
        ctx.fillStyle = heartColor; ctx.font = `800 14px ${fontFam}`; ctx.fillText('BPM', 155, 60);

    } else {
        const w = 215, h = 82;
        if (bgOpacity > 0.02) {
            ctx.fillStyle = `rgba(15, 23, 42, ${bgOpacity})`;
            ctx.beginPath(); ctx.roundRect(0, 0, w, h, 41); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
        }
        ctx.save(); ctx.translate(36, 38); ctx.scale(beatScale, beatScale);
        drawHeartVector(ctx, 0, -12, 26, heartColor); ctx.restore();
        ctx.fillStyle = '#ffffff'; ctx.font = `900 42px ${fontFam}`; ctx.fillText(`${bpm}`, 62, 54);
        ctx.fillStyle = zInfo.color; ctx.font = `700 13px ${fontFam}`; ctx.fillText(`BPM • Z${zInfo.zone}`, 142, 50);
    }

    ctx.restore();
}

// Daftarkan fungsi render ke dalam Hook Utama app.js
window.overlayRenderHooks.push(renderHrOverlay);

// Drag & Drop Posisi Widget HR di Kanvas
canvas.addEventListener('mousedown', function(e) {
    if (!document.getElementById('showHrWidget')?.checked) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (Math.hypot(mx - (hrPos.x + 85), my - (hrPos.y + 50)) < 110) {
        isDraggingHr = true;
        hrDragOffset = { x: mx - hrPos.x, y: my - hrPos.y };
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isDraggingHr) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    hrPos = { x: mx - hrDragOffset.x, y: my - hrDragOffset.y };
    renderFrame();
});

window.addEventListener('mouseup', () => { isDraggingHr = false; });

// Ekstraktor Screenshot Grafik Huawei Health
function extractFromGraphImage(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            const off = document.createElement('canvas');
            off.width = img.width; off.height = img.height;
            const octx = off.getContext('2d');
            octx.drawImage(img, 0, 0);
            const steps = Math.ceil(Math.max(60, trimEndTotalSec - trimStartTotalSec) / hrIntervalSec);
            const extracted = [];
            const data = octx.getImageData(0, 0, img.width, img.height).data;
            for (let i = 0; i < steps; i++) {
                const x = Math.floor((i / steps) * (img.width * 0.8) + (img.width * 0.1));
                let foundY = -1;
                for (let y = Math.floor(img.height * 0.15); y < Math.floor(img.height * 0.85); y++) {
                    const idx = (y * img.width + x) * 4;
                    if (data[idx] > 180 && data[idx+1] < 110 && data[idx+2] < 110 && (data[idx] - data[idx+1]) > 80) {
                        foundY = y; break;
                    }
                }
                if (foundY !== -1) {
                    const norm = 1 - ((foundY - img.height * 0.15) / (img.height * 0.7));
                    extracted.push(Math.max(60, Math.min(200, Math.round(95 + norm * 85))));
                } else {
                    extracted.push(extracted.length ? extracted[extracted.length - 1] : 140);
                }
            }
            document.getElementById('hrDataInput').value = extracted.join(', ');
            parseHrInput();
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

// Upload File .TCX / .CSV ke Handler PHP
function uploadFileToPhp(input) {
    const file = input.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('action', 'parse_file');
    fd.append('hr_file', file);
    fetch('', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(res => {
            if (res.status === 'success') {
                document.getElementById('hrDataInput').value = res.data.join(', ');
                parseHrInput();
            }
        });
}

// Inisialisasi data sampel HR saat halaman dimuat
generateSampleHr();