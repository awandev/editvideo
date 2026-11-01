/**
 * MASTER TEMPLATE MODULE (CAMCORDER VHS VIEWFINDER PRESET & STYLE LOCK)
 */

let isMasterTemplateActive = false;
let savedWidgetStates = null;

if (typeof modalTitles !== 'undefined') {
    modalTitles.template = 'Master Template Preset';
}

function formatCamcorderHHMMSS(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function syncTemplateInputsToModules() {
    const l1 = document.getElementById('tplCamLine1')?.value || '';
    const l2 = document.getElementById('tplCamLine2')?.value || '';
    const titleTag = document.getElementById('titleTag');
    const titleMain = document.getElementById('titleMain');
    if (titleTag) titleTag.value = l1;
    if (titleMain) titleMain.value = l2;
    renderFrame();
}

// Kunci / Buka Kunci Pengaturan Style di Tab HR, Timer, Title, Workout, Watermark, dan Result
function setStyleTabsLocked(locked) {
    const styleTabs = ['tab_hr', 'tab_timer', 'tab_title', 'tab_workout', 'tab_watermark', 'tab_result'];

    // Daftar ID input data BPM & Repetisi yang tetap boleh diisi walau style terkunci
    const allowedDataIds = [
        'hrDataInput',
        'spacebarMode',
        'debounceMsSelect'
    ];

    styleTabs.forEach(tabId => {
        const pane = document.getElementById(tabId);
        if (!pane) return;

        // Tambahkan/hapus banner informasi kunci di bagian atas masing-masing tab
        let lockNotice = pane.querySelector('.master-lock-notice');
        if (locked) {
            if (!lockNotice) {
                lockNotice = document.createElement('div');
                lockNotice.className = 'master-lock-notice bg-orange-500/10 border-b border-orange-500/30 px-4 py-2 text-[10px] text-orange-300 font-mono-tech flex items-center justify-between';
                lockNotice.innerHTML = `
                    <span>🔒 STYLE LOCKED BY TEMPLATE</span>
                    <button type="button" onclick="openSideModal('template')" class="underline hover:text-white">Manage</button>
                `;
                pane.prepend(lockNotice);
            }
        } else if (lockNotice) {
            lockNotice.remove();
        }

        // Disable semua select, input, dan button style di dalam tab tersebut
        const controls = pane.querySelectorAll('select, input, button');
        controls.forEach(ctrl => {
            if (ctrl.closest('.master-lock-notice')) return;
            // Biarkan upload file data BPM (.tcx / screenshot grafik) dan textarea BPM tetap aktif
            if (allowedDataIds.includes(ctrl.id) || (tabId === 'tab_hr' && ctrl.type === 'file')) {
                return;
            }
            ctrl.disabled = locked;
            if (locked) {
                ctrl.classList.add('opacity-40', ' pointer-events-none');
            } else {
                ctrl.classList.remove('opacity-40', ' pointer-events-none');
            }
        });
    });
}

function toggleMasterTemplateMode(enabled) {
    isMasterTemplateActive = enabled;
    const banner = document.getElementById('tplLockBanner');
    if (banner) {
        if (enabled) banner.classList.remove('hidden');
        else banner.classList.add('hidden');
    }

    const individualCheckboxes = [
        'showHrWidget',
        'showTimerWidget',
        'showWorkoutList',
        'showTopTitle',
        'showWatermarkWidget',
        'showFinisherCard',
        'forcePreviewResult'
    ];

    if (enabled) {
        // Simpan status visibilitas widget sebelumnya
        savedWidgetStates = {};
        individualCheckboxes.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                savedWidgetStates[id] = el.checked;
                el.checked = false; // Matikan render widget individual agar digantikan oleh Master Template
            }
        });
        setStyleTabsLocked(true);
    } else {
        // Kembalikan status visibilitas widget seperti semula saat Template dimatikan
        if (savedWidgetStates) {
            individualCheckboxes.forEach(id => {
                const el = document.getElementById(id);
                if (el && savedWidgetStates[id] !== undefined) {
                    el.checked = savedWidgetStates[id];
                }
            });
        }
        setStyleTabsLocked(false);
    }

    renderFrame();
}

// Helper: Gambar Sudut Siku Bulat (Viewfinder Corner Bracket)
function drawTplCornerBracket(ctx, x, y, armLen, radius, cornerType, lineWidth) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    if (cornerType === 'tl') {
        ctx.moveTo(x, y + armLen);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + armLen, y);
    } else if (cornerType === 'tr') {
        ctx.moveTo(x - armLen, y);
        ctx.lineTo(x - radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.lineTo(x, y + armLen);
    } else if (cornerType === 'bl') {
        ctx.moveTo(x, y - armLen);
        ctx.lineTo(x, y - radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + armLen, y);
    } else if (cornerType === 'br') {
        ctx.moveTo(x - armLen, y);
        ctx.lineTo(x - radius, y);
        ctx.quadraticCurveTo(x, y, x, y - radius);
        ctx.lineTo(x, y - armLen);
    }

    ctx.stroke();
    ctx.restore();
}

// Helper: Gambar Ikon Hati Merah Camcorder
function drawTplHeartIcon(ctx, cx, cy, size, scale = 1.0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ff2a2a';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    const t = size * 0.3;
    const topY = -size * 0.5;
    ctx.moveTo(0, topY + t);
    ctx.bezierCurveTo(0, topY, -size / 2, topY, -size / 2, topY + t);
    ctx.bezierCurveTo(-size / 2, topY + (size + t) / 2, 0, topY + (size + t) / 1.75, 0, topY + size);
    ctx.bezierCurveTo(0, topY + (size + t) / 1.75, size / 2, topY + (size + t) / 2, size / 2, topY + t);
    ctx.bezierCurveTo(size / 2, topY, 0, topY, 0, topY + t);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Helper: Gambar Ikon Stopwatch Putih Camcorder (Sesuai Gambar Referensi)
function drawTplStopwatchIcon(ctx, cx, cy, r, lineWidth) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 6;

    // Lingkaran utama stopwatch
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Tombol crown atas stopwatch
    const stemH = r * 0.32;
    const capW  = r * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy - r - stemH);
    ctx.moveTo(cx - capW / 2, cy - r - stemH);
    ctx.lineTo(cx + capW / 2, cy - r - stemH);
    ctx.stroke();

    // Tombol miring kanan atas
    const ang = -Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    ctx.lineTo(cx + Math.cos(ang) * (r * 1.28), cy + Math.sin(ang) * (r * 1.28));
    ctx.stroke();

    // Jarum jam di dalam stopwatch
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - r * 0.55);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * 0.42, cy + r * 0.2);
    ctx.stroke();

    ctx.restore();
}

// Render Master Template Camcorder (Identik dengan Gambar Referensi)
function renderMasterTemplateOverlay(ctx) {
    if (!isMasterTemplateActive) return;

    const cW = canvas.width || 1080;
    const cH = canvas.height || 1920;
    const s  = Math.min(cW, cH) / 1080; // Skala proporsional terhadap Full HD 1080p

    const line1Text = document.getElementById('tplCamLine1')?.value ?? 'DAY 29';
    const line2Text = document.getElementById('tplCamLine2')?.value ?? '100 Pull ups';
    const recText   = document.getElementById('tplCamRec')?.value ?? 'REC';
    const resText   = document.getElementById('tplCamRes')?.value ?? 'HD 1080p';
    const heartMode = document.getElementById('tplCamHeartMode')?.value || 'pulse';
    const recBlink  = document.getElementById('tplCamRecBlink')?.value || 'blink';
    const vigAlpha  = parseFloat(document.getElementById('tplCamVignette')?.value ?? 0.35);

    const fontFam = "'VCR OSD Mono', 'Share Tech Mono', monospace";

    // Ambil nilai BPM aktif dari hrValues (update tiap 5 detik)
    const workoutElapsedSec = Math.max(0, currentVideoSec - trimStartTotalSec);
    const hrInterval = (typeof hrIntervalSec !== 'undefined') ? hrIntervalSec : 5;
    const hrIdx = Math.floor(workoutElapsedSec / hrInterval);
    const currentBpm = (typeof hrValues !== 'undefined' && hrValues.length > 0)
        ? (hrValues[hrIdx % hrValues.length] || 170)
        : 170;

    // Hitung denyut jantung jika mode Pulsing dipilih
    let heartBeatScale = 1.0;
    if (heartMode === 'pulse' && isPlayingSim) {
        const freq = (currentBpm / 60) * Math.PI * 2;
        heartBeatScale = 1.0 + Math.sin((performance.now() / 1000) * freq) * 0.08;
    }

    ctx.save();

    // 1. VIGNETTE GELAP HALUS DI TEPI ATAS & BAWAH (Agar teks putih selalu kontras)
    if (vigAlpha > 0.01) {
        const topGrad = ctx.createLinearGradient(0, 0, 0, cH * 0.18);
        topGrad.addColorStop(0, `rgba(0, 0, 0, ${vigAlpha})`);
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, cW, cH * 0.18);

        const botGrad = ctx.createLinearGradient(0, cH * 0.80, 0, cH);
        botGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        botGrad.addColorStop(1, `rgba(0, 0, 0, ${vigAlpha})`);
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, cH * 0.80, cW, cH * 0.20);
    }

    // Parameter Geometri Bingkai Sudut Camcorder
    const marginX = Math.round(36 * s);
    const marginY = Math.round(46 * s);
    const armLen  = Math.round(78 * s);
    const cornerR = Math.round(20 * s);
    const strokeW = Math.max(3, 5.5 * s);

    // 2. GAMBAR 4 SIKU SUDUT CAMCORDER (TL, TR, BL, BR)
    drawTplCornerBracket(ctx, marginX, marginY, armLen, cornerR, 'tl', strokeW);
    drawTplCornerBracket(ctx, cW - marginX, marginY, armLen, cornerR, 'tr', strokeW);
    drawTplCornerBracket(ctx, marginX, cH - marginY, armLen, cornerR, 'bl', strokeW);
    drawTplCornerBracket(ctx, cW - marginX, cH - marginY, armLen, cornerR, 'br', strokeW);

    // Gaya Bayangan Teks OSD Camcorder
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = Math.round(8 * s);
    ctx.shadowOffsetX = Math.round(2 * s);
    ctx.shadowOffsetY = Math.round(2 * s);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';

    // 3. TEKS KIRI ATAS ("DAY 29" & "100 Pull ups")
    const tlTextX = marginX + Math.round(42 * s);
    const tlLine1Y = marginY + Math.round(52 * s);
    const tlLine2Y = marginY + Math.round(108 * s);

    ctx.font = `700 ${Math.round(46 * s)}px ${fontFam}`;
    ctx.fillText(line1Text, tlTextX, tlLine1Y);

    ctx.font = `700 ${Math.round(43 * s)}px ${fontFam}`;
    ctx.fillText(line2Text, tlTextX, tlLine2Y);

    // 4. INDIKATOR KANAN ATAS ("● REC")
    if (recText.trim() !== '') {
        ctx.font = `700 ${Math.round(45 * s)}px ${fontFam}`;
        const recW = ctx.measureText(recText).width;
        const recX = (cW - marginX) - Math.round(38 * s) - recW;
        const recY = marginY + Math.round(66 * s);

        const showDot = (recBlink === 'solid') || !isPlayingSim || (Math.floor(performance.now() / 550) % 2 === 0);
        if (showDot) {
            ctx.save();
            ctx.fillStyle = '#ff2222';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = Math.round(6 * s);
            ctx.beginPath();
            ctx.arc(recX - Math.round(28 * s), recY - Math.round(16 * s), Math.round(15 * s), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillText(recText, recX, recY);
    }

    // 5. TELEMETRI KIRI BAWAH (❤️ 170 BPM & ⏱ 00:12:45)
    const blIconCenterX = marginX + Math.round(40 * s);
    const blTextX       = marginX + Math.round(86 * s);

    // Baris Atas Kiri Bawah: Heart Merah + Angka BPM + Label BPM
    const hrRowY = (cH - marginY) - Math.round(102 * s);
    drawTplHeartIcon(ctx, blIconCenterX, hrRowY - Math.round(16 * s), Math.round(38 * s), heartBeatScale);

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(52 * s)}px ${fontFam}`;
    const bpmStr = String(currentBpm);
    ctx.fillText(bpmStr, blTextX, hrRowY);

    const bpmNumW = ctx.measureText(bpmStr).width;
    ctx.font = `700 ${Math.round(36 * s)}px ${fontFam}`;
    ctx.fillText('BPM', blTextX + bpmNumW + Math.round(14 * s), hrRowY);

    // Baris Bawah Kiri Bawah: Ikon Stopwatch Putih + 00:12:45
    const timerRowY = (cH - marginY) - Math.round(38 * s);
    drawTplStopwatchIcon(ctx, blIconCenterX, timerRowY - Math.round(15 * s), Math.round(17 * s), Math.max(2.2, 3.2 * s));

    const timeFormatted = formatCamcorderHHMMSS(workoutElapsedSec);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(46 * s)}px ${fontFam}`;
    ctx.fillText(timeFormatted, blTextX, timerRowY);

    // 6. FORMAT LABEL KANAN BAWAH ("HD 1080p")
    if (resText.trim() !== '') {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.round(34 * s)}px ${fontFam}`;
        ctx.fillText(resText, (cW - marginX) - Math.round(28 * s), (cH - marginY) - Math.round(26 * s));
        ctx.textAlign = 'left';
    }

    ctx.restore();
}

// Daftarkan ke dalam Hook Render Utama
window.overlayRenderHooks.push(renderMasterTemplateOverlay);