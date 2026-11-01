/**
 * WORKOUT THUMBNAIL STUDIO MODULE (20 GYM STYLES + FRAME GRABBER + DARK SCRIM)
 */

let thumbPos = { x: 540, y: 1420 };
let isDraggingThumb = false;
let thumbDragOffset = { x: 0, y: 0 };

let isThumbFrameFrozen = false;
let frozenFrameCanvas = null;
let frozenTimeSec = 0;

if (typeof modalTitles !== 'undefined') {
    modalTitles.thumbnail = 'Thumbnail Studio (20 Styles)';
}

function hexToRgbaThumb(hex, alpha = 1) {
    hex = (hex || '#ef4444').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 239;
    const g = parseInt(hex.substring(2, 4), 16) || 68;
    const b = parseInt(hex.substring(4, 6), 16) || 68;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function enableThumbOnEdit() {
    const cb = document.getElementById('enableThumbMode');
    if (cb && !cb.checked) {
        cb.checked = true;
    }
    renderFrame();
}

function toggleThumbnailMode(enabled) {
    if (enabled && isPlayingSim && typeof window.togglePlaySim === 'function') {
        window.togglePlaySim(); // Otomatis pause video saat masuk mode Thumbnail
    }
    renderFrame();
}

// Geser video maju/mundur per frame (0.04s) untuk mencari pose otot terbaik
function stepVideoFrame(deltaSec) {
    if (isPlayingSim && typeof window.togglePlaySim === 'function') {
        window.togglePlaySim();
    }
    if (isThumbFrameFrozen) {
        toggleFreezeThumbFrame(); // Buka kunci dulu jika sedang di-freeze
    }
    currentVideoSec = Math.max(trimStartTotalSec, Math.min(trimEndTotalSec, Number((currentVideoSec + deltaSec).toFixed(2))));
    const slider = document.getElementById('timelineSlider');
    if (slider) slider.value = currentVideoSec;

    if (useVideoBg && hiddenVideo) {
        hiddenVideo.currentTime = currentVideoSec;
    }
    const lbl = document.getElementById('lblThumbFrameTime');
    if (lbl) lbl.innerText = `Frame @ ${formatMMSS(currentVideoSec)}`;
    renderFrame();
}

// Kunci / Freeze frame video saat ini ke dalam buffer
function toggleFreezeThumbFrame() {
    const btn = document.getElementById('btnFreezeThumb');
    const lbl = document.getElementById('lblFreezeThumbBtn');
    const timeBadge = document.getElementById('lblThumbFrameTime');

    if (isThumbFrameFrozen) {
        isThumbFrameFrozen = false;
        frozenFrameCanvas = null;
        if (btn) btn.className = 'w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition';
        if (lbl) lbl.innerText = 'Pause & Lock Pose Saat Ini';
        if (timeBadge) timeBadge.innerText = 'Live Frame';
        renderFrame();
        return;
    }

    if (isPlayingSim && typeof window.togglePlaySim === 'function') {
        window.togglePlaySim();
    }

    // Tangkap sumber video/gambar murni ke dalam offscreen canvas
    const srcMedia = (useVideoBg && hiddenVideo.readyState >= 2) ? hiddenVideo : bgImage;
    if (srcMedia) {
        const mW = srcMedia.videoWidth || srcMedia.width || 1080;
        const mH = srcMedia.videoHeight || srcMedia.height || 1920;
        frozenFrameCanvas = document.createElement('canvas');
        frozenFrameCanvas.width = mW;
        frozenFrameCanvas.height = mH;
        const fCtx = frozenFrameCanvas.getContext('2d');
        fCtx.drawImage(srcMedia, 0, 0, mW, mH);
    }

    isThumbFrameFrozen = true;
    frozenTimeSec = currentVideoSec;

    // Aktifkan mode thumbnail otomatis
    const cb = document.getElementById('enableThumbMode');
    if (cb) cb.checked = true;

    if (btn) btn.className = 'w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition shadow-lg';
    if (lbl) lbl.innerText = `Pose Terkunci (${formatMMSS(frozenTimeSec)}) — Klik untuk Ganti`;
    if (timeBadge) timeBadge.innerText = `Locked @ ${formatMMSS(frozenTimeSec)}`;

    renderFrame();
}

function resetThumbExposure() {
    document.getElementById('thumbDarkSlider').value = 0.60;
    document.getElementById('lblThumbDark').innerText = '60%';
    document.getElementById('thumbVigSlider').value = 0.65;
    document.getElementById('lblThumbVig').innerText = '65%';
    document.getElementById('thumbContrastSlider').value = 0.20;
    document.getElementById('lblThumbContrast').innerText = '20%';
    document.getElementById('thumbBwPhoto').checked = false;
    renderFrame();
}

function snapThumbPosition(zone) {
    const cW = canvas.width || 1080;
    const cH = canvas.height || 1920;
    if (zone === 'top') {
        thumbPos = { x: Math.round(cW / 2), y: Math.round(cH * 0.24) };
    } else if (zone === 'center') {
        thumbPos = { x: Math.round(cW / 2), y: Math.round(cH * 0.52) };
    } else {
        thumbPos = { x: Math.round(cW / 2), y: Math.round(cH * 0.76) };
    }
    enableThumbOnEdit();
}

function resetThumbPosition() {
    snapThumbPosition('bottom');
}

function exportThumbnailImage(format = 'png') {
    const cb = document.getElementById('enableThumbMode');
    if (cb && !cb.checked) cb.checked = true;
    renderFrame();

    const mime = (format === 'jpeg') ? 'image/jpeg' : 'image/png';
    const ext  = (format === 'jpeg') ? 'jpg' : 'png';
    const l1   = (document.getElementById('thumbLine1Text')?.value || 'workout').trim().replace(/\s+/g, '_').toLowerCase();

    const a = document.createElement('a');
    a.download = `thumbnail_${l1}_${canvas.width}x${canvas.height}.${ext}`;
    a.href = canvas.toDataURL(mime, 0.95);
    a.click();
}

// ============================================================================
// 1. GAMBAR EFEK GELAP (DARK SCRIM), VIGNETTE & KONTRAS FOTO
// ============================================================================
function drawThumbnailPhotoScrim(ctx, cW, cH) {
    const scrimMode = document.getElementById('thumbScrimMode')?.value || 'bottom_heavy';
    const darkAlpha = parseFloat(document.getElementById('thumbDarkSlider')?.value ?? 0.60);
    const vigAlpha  = parseFloat(document.getElementById('thumbVigSlider')?.value ?? 0.65);

    ctx.save();

    // A. Pola Penggelap Utama (Scrim Pattern)
    if (darkAlpha > 0.01) {
        if (scrimMode === 'bottom_heavy') {
            const grad = ctx.createLinearGradient(0, cH * 0.25, 0, cH);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            grad.addColorStop(0.55, `rgba(5, 5, 8, ${(darkAlpha * 0.65).toFixed(3)})`);
            grad.addColorStop(1, `rgba(5, 5, 8, ${Math.min(0.98, darkAlpha * 1.15).toFixed(3)})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, cW, cH);

        } else if (scrimMode === 'radial_spotlight') {
            const rad = ctx.createRadialGradient(cW / 2, cH * 0.42, Math.min(cW, cH) * 0.15, cW / 2, cH * 0.48, Math.max(cW, cH) * 0.70);
            rad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            rad.addColorStop(0.6, `rgba(6, 6, 10, ${(darkAlpha * 0.55).toFixed(3)})`);
            rad.addColorStop(1, `rgba(4, 4, 8, ${Math.min(0.98, darkAlpha * 1.15).toFixed(3)})`);
            ctx.fillStyle = rad;
            ctx.fillRect(0, 0, cW, cH);

        } else if (scrimMode === 'top_bottom') {
            const topG = ctx.createLinearGradient(0, 0, 0, cH * 0.38);
            topG.addColorStop(0, `rgba(5, 5, 8, ${darkAlpha.toFixed(3)})`);
            topG.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = topG;
            ctx.fillRect(0, 0, cW, cH * 0.38);

            const botG = ctx.createLinearGradient(0, cH * 0.52, 0, cH);
            botG.addColorStop(0, 'rgba(0, 0, 0, 0)');
            botG.addColorStop(1, `rgba(5, 5, 8, ${Math.min(0.98, darkAlpha * 1.15).toFixed(3)})`);
            ctx.fillStyle = botG;
            ctx.fillRect(0, cH * 0.52, cW, cH * 0.48);

        } else if (scrimMode === 'left_heavy') {
            const leftG = ctx.createLinearGradient(0, 0, cW * 0.85, 0);
            leftG.addColorStop(0, `rgba(5, 5, 8, ${Math.min(0.96, darkAlpha * 1.15).toFixed(3)})`);
            leftG.addColorStop(0.55, `rgba(5, 5, 8, ${(darkAlpha * 0.55).toFixed(3)})`);
            leftG.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = leftG;
            ctx.fillRect(0, 0, cW, cH);

        } else if (scrimMode === 'diagonal_slash') {
            const diagG = ctx.createLinearGradient(0, cH, cW, cH * 0.2);
            diagG.addColorStop(0, `rgba(5, 5, 8, ${Math.min(0.98, darkAlpha * 1.2).toFixed(3)})`);
            diagG.addColorStop(0.55, `rgba(5, 5, 8, ${(darkAlpha * 0.6).toFixed(3)})`);
            diagG.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = diagG;
            ctx.fillRect(0, 0, cW, cH);

        } else {
            // Full Uniform Dim
            ctx.fillStyle = `rgba(6, 6, 10, ${darkAlpha.toFixed(3)})`;
            ctx.fillRect(0, 0, cW, cH);
        }
    }

    // B. Edge Vignette Tambahan
    if (vigAlpha > 0.01) {
        const vRad = ctx.createRadialGradient(cW / 2, cH / 2, Math.min(cW, cH) * 0.30, cW / 2, cH / 2, Math.max(cW, cH) * 0.72);
        vRad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vRad.addColorStop(1, `rgba(0, 0, 0, ${(vigAlpha * 0.85).toFixed(3)})`);
        ctx.fillStyle = vRad;
        ctx.fillRect(0, 0, cW, cH);
    }

    ctx.restore();
}

// ============================================================================
// 2. ENGINE 20 GYM THUMBNAIL STYLES
// ============================================================================
function renderThumbnailOverlay(ctx) {
    const enabled = document.getElementById('enableThumbMode')?.checked;
    if (!enabled) return;

    const cW = canvas.width || 1080;
    const cH = canvas.height || 1920;
    const s  = (Math.min(cW, cH) / 720) * parseFloat(document.getElementById('thumbScaleSlider')?.value || 1.0);

    const style       = document.getElementById('thumbStyleSelect')?.value || 'yt_heavy_stack';
    const fontFam     = document.getElementById('thumbFontSelect')?.value || "'Anton', sans-serif";
    const badgeText   = (document.getElementById('thumbBadgeText')?.value || '').trim().toUpperCase();
    const line1Text   = (document.getElementById('thumbLine1Text')?.value || '').trim().toUpperCase();
    const line2Text   = (document.getElementById('thumbLine2Text')?.value || '').trim().toUpperCase();
    const subText     = (document.getElementById('thumbSubText')?.value || '').trim().toUpperCase();

    const colPrimary  = document.getElementById('thumbPrimaryColor')?.value || '#ffffff';
    const colAccent   = document.getElementById('thumbAccentColor')?.value || '#facc15';
    const colBadge    = document.getElementById('thumbBadgeColor')?.value || '#ef4444';

    // 1. Gambar Efek Gelap (Scrim & Vignette) di atas foto terlebih dahulu
    drawThumbnailPhotoScrim(ctx, cW, cH);

    // 2. Beberapa Style Full-Frame (Seperti Magazine Masthead, Cinema Letterbox, Polaroid, Neon Frame, Camcorder)
    if (style === 'cinema_letterbox') {
        const barH = Math.round(cH * 0.12);
        ctx.fillStyle = '#050507';
        ctx.fillRect(0, 0, cW, barH);
        ctx.fillRect(0, cH - barH, cW, barH);

        ctx.fillStyle = colAccent;
        ctx.fillRect(0, barH - 3, cW, 3);
        ctx.fillRect(0, cH - barH, cW, 3);

        ctx.textAlign = 'center';
        if (badgeText) {
            ctx.fillStyle = colAccent;
            ctx.font = `700 ${Math.round(22 * s)}px 'JetBrains Mono', monospace`;
            ctx.fillText(`// ${badgeText} //`, cW / 2, barH * 0.62);
        }
        if (subText) {
            ctx.fillStyle = '#d4d4d8';
            ctx.font = `700 ${Math.round(20 * s)}px 'JetBrains Mono', monospace`;
            ctx.fillText(subText, cW / 2, cH - barH * 0.42);
        }
    } else if (style === 'polaroid_docu') {
        const pad = Math.round(36 * s);
        const botPad = Math.round(250 * s);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = pad;
        ctx.strokeRect(pad / 2, pad / 2, cW - pad, cH - pad);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, cH - botPad, cW, botPad);

        ctx.textAlign = 'left';
        if (badgeText) {
            ctx.fillStyle = colBadge;
            ctx.font = `800 ${Math.round(20 * s)}px 'JetBrains Mono', monospace`;
            ctx.fillText(badgeText, pad * 1.4, cH - botPad + Math.round(52 * s));
        }
        ctx.fillStyle = '#09090b';
        ctx.font = `900 ${Math.round(68 * s)}px ${fontFam}`;
        ctx.fillText(`${line1Text} ${line2Text}`, pad * 1.4, cH - botPad + Math.round(135 * s));

        if (subText) {
            ctx.fillStyle = '#52525b';
            ctx.font = `700 ${Math.round(20 * s)}px 'JetBrains Mono', monospace`;
            ctx.fillText(subText, pad * 1.4, cH - botPad + Math.round(188 * s));
        }
        return;
    } else if (style === 'mag_neon_border') {
        const m = Math.round(38 * s);
        ctx.save();
        ctx.shadowColor = colAccent;
        ctx.shadowBlur = 22;
        ctx.strokeStyle = colAccent;
        ctx.lineWidth = Math.max(4, 6 * s);
        ctx.strokeRect(m, m, cW - m * 2, cH - m * 2);
        ctx.restore();
    } else if (style === 'mag_cover_masthead') {
        // Masthead Majalah Besar di Puncak Atas + Highlight di Posisi Drag
        ctx.save();
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 18;
        if (badgeText) {
            ctx.fillStyle = colAccent;
            ctx.font = `800 ${Math.round(22 * s)}px ${fontFam}`;
            ctx.fillText(badgeText, cW / 2, Math.round(70 * s));
        }
        ctx.fillStyle = colPrimary;
        ctx.font = `900 ${Math.round(118 * s)}px ${fontFam}`;
        ctx.fillText(line1Text, cW / 2, Math.round(188 * s));
        ctx.restore();
    } else if (style === 'yt_versus_banner') {
        // Top & Bottom Heavy Broadcast Bars
        const topH = Math.round(145 * s);
        ctx.fillStyle = colBadge;
        ctx.fillRect(0, 0, cW, topH);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(58 * s)}px ${fontFam}`;
        ctx.fillText(badgeText || line1Text, cW / 2, Math.round(topH * 0.68));
    } else if (style === 'cam_rec_poster') {
        // Sudut Viewfinder Camcorder + ● REC Besar
        const m = Math.round(38 * s), arm = Math.round(68 * s), lw = Math.max(4, 5 * s);
        ctx.save();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(m, m + arm); ctx.lineTo(m, m); ctx.lineTo(m + arm, m);
        ctx.moveTo(cW - m - arm, m); ctx.lineTo(cW - m, m); ctx.lineTo(cW - m, m + arm);
        ctx.moveTo(m, cH - m - arm); ctx.lineTo(m, cH - m); ctx.lineTo(m + arm, cH - m);
        ctx.moveTo(cW - m - arm, cH - m); ctx.lineTo(cW - m, cH - m); ctx.lineTo(cW - m, cH - m - arm);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.round(34 * s)}px 'VCR OSD Mono', monospace`;
        ctx.fillText(`PLAY ►  ${formatMMSS(currentVideoSec)}`, m + Math.round(28 * s), m + Math.round(58 * s));

        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(cW - m - Math.round(135 * s), m + Math.round(45 * s), Math.round(14 * s), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('REC', cW - m - Math.round(105 * s), m + Math.round(58 * s));
        ctx.restore();
    }

    // 3. Gambar Tipografi Utama pada Titik Anchor (thumbPos.x, thumbPos.y)
    ctx.save();
    ctx.translate(thumbPos.x, thumbPos.y);
    ctx.scale(s, s);
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    // --- GROUP 1: YOUTUBE & REELS HIGH-IMPACT ---
    if (style === 'yt_heavy_stack' || style === 'cinema_letterbox' || style === 'mag_neon_border') {
        // 01: Giant 2-Tone Impact Stack
        if (badgeText && style !== 'cinema_letterbox') {
            ctx.font = `800 24px ${fontFam}`;
            const bw = ctx.measureText(badgeText).width + 44;
            ctx.fillStyle = colBadge;
            ctx.beginPath(); ctx.roundRect(-bw / 2, -165, bw, 42, 8); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillText(badgeText, 0, -135);
        }

        ctx.fillStyle = colPrimary;
        ctx.font = `900 92px ${fontFam}`;
        ctx.fillText(line1Text, 0, -45);

        ctx.fillStyle = colAccent;
        ctx.font = `900 106px ${fontFam}`;
        ctx.fillText(line2Text, 0, 52);

        if (subText && style !== 'cinema_letterbox') {
            ctx.fillStyle = '#e4e4e7';
            ctx.font = `800 22px ${fontFam}`;
            ctx.fillText(subText, 0, 98);
        }

    } else if (style === 'yt_slanted_tape') {
        // 02: Slanted Warning Tape Bars (-4 deg)
        ctx.rotate(-4 * Math.PI / 180);
        ctx.shadowColor = 'rgba(0,0,0,0.85)';

        if (badgeText) {
            ctx.font = `900 24px ${fontFam}`;
            const bw = ctx.measureText(badgeText).width + 36;
            ctx.fillStyle = colBadge;
            ctx.fillRect(-bw / 2, -162, bw, 38);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(badgeText, 0, -134);
        }

        ctx.font = `900 78px ${fontFam}`;
        const w1 = Math.max(380, ctx.measureText(line1Text).width + 64);
        ctx.fillStyle = colAccent;
        ctx.fillRect(-w1 / 2, -110, w1, 86);
        ctx.fillStyle = '#09090b';
        ctx.shadowBlur = 0;
        ctx.fillText(line1Text, 0, -42);

        ctx.font = `900 82px ${fontFam}`;
        const w2 = Math.max(340, ctx.measureText(line2Text).width + 64);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-w2 / 2, -14, w2, 90);
        ctx.strokeStyle = colAccent; ctx.lineWidth = 3; ctx.strokeRect(-w2 / 2, -14, w2, 90);
        ctx.fillStyle = colPrimary;
        ctx.fillText(line2Text, 0, 56);

    } else if (style === 'yt_highlight_box') {
        // 03: Solid Action Box Highlight
        if (badgeText) {
            ctx.fillStyle = colAccent;
            ctx.font = `800 26px ${fontFam}`;
            ctx.fillText(`⚡ ${badgeText} ⚡`, 0, -135);
        }

        ctx.fillStyle = colPrimary;
        ctx.font = `900 88px ${fontFam}`;
        ctx.fillText(line1Text, 0, -45);

        ctx.font = `900 92px ${fontFam}`;
        const w2 = Math.max(300, ctx.measureText(line2Text).width + 70);
        ctx.fillStyle = colBadge;
        ctx.beginPath();
        ctx.moveTo(-w2 / 2 + 16, -22); ctx.lineTo(w2 / 2, -22);
        ctx.lineTo(w2 / 2 - 16, 72); ctx.lineTo(-w2 / 2, 72);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(line2Text, 0, 52);

        if (subText) {
            ctx.fillStyle = colAccent;
            ctx.font = `800 22px ${fontFam}`;
            ctx.fillText(subText, 0, 108);
        }

    } else if (style === 'yt_outline_echo') {
        // 04: Triple Hollow Stroke Echo
        ctx.font = `900 96px ${fontFam}`;
        [3, 2, 1].forEach(i => {
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = hexToRgbaThumb(colAccent, 0.28 / i);
            ctx.lineWidth = 3;
            ctx.strokeText(line1Text, 0, -55 - i * 26);
            ctx.strokeText(line2Text, 0, 55 + i * 26);
            ctx.restore();
        });

        if (badgeText) {
            ctx.fillStyle = colBadge;
            ctx.font = `800 24px ${fontFam}`;
            ctx.fillText(badgeText, 0, -145);
        }
        ctx.fillStyle = colPrimary;
        ctx.font = `900 96px ${fontFam}`;
        ctx.fillText(line1Text, 0, -42);

        ctx.fillStyle = colAccent;
        ctx.font = `900 102px ${fontFam}`;
        ctx.fillText(line2Text, 0, 52);

    } else if (style === 'yt_versus_banner') {
        // 05: Bottom Heavy Box
        ctx.fillStyle = 'rgba(9, 9, 11, 0.90)';
        ctx.fillRect(-340, -100, 680, 195);
        ctx.fillStyle = colAccent;
        ctx.fillRect(-340, -100, 680, 8);

        ctx.fillStyle = colPrimary;
        ctx.font = `900 76px ${fontFam}`;
        ctx.fillText(line1Text, 0, -18);

        ctx.fillStyle = colAccent;
        ctx.font = `900 82px ${fontFam}`;
        ctx.fillText(line2Text, 0, 64);

    // --- GROUP 2: CALISTHENICS & HARDCORE GRIT ---
    } else if (style === 'cali_stencil_stamp') {
        // 06: Military Stencil Box Stamp
        const w = 580, h = 235;
        ctx.fillStyle = 'rgba(9, 9, 11, 0.82)';
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = colAccent; ctx.lineWidth = 6;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.fillStyle = colBadge;
        ctx.fillRect(-w / 2, -h / 2, w, 46);

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 24px ${fontFam}`;
        ctx.fillText(badgeText || 'CLASSIFIED WORKOUT LOG', 0, -h / 2 + 32);

        ctx.fillStyle = colPrimary;
        ctx.font = `900 74px ${fontFam}`;
        ctx.fillText(line1Text, 0, -2);

        ctx.fillStyle = colAccent;
        ctx.font = `900 78px ${fontFam}`;
        ctx.fillText(line2Text, 0, 76);

        if (subText) {
            ctx.fillStyle = '#a1a1aa';
            ctx.font = `700 18px 'JetBrains Mono', monospace`;
            ctx.fillText(subText, 0, h / 2 - 14);
        }

    } else if (style === 'cali_vertical_spine') {
        // 07: Vertical Spine + Giant Left-Aligned Stack
        const lx = -240;
        ctx.save();
        ctx.translate(lx - 32, 20);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = colBadge;
        ctx.fillRect(-115, -22, 230, 38);
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 22px ${fontFam}`;
        ctx.fillText(badgeText || 'CALISTHENICS', 0, 4);
        ctx.restore();

        ctx.textAlign = 'left';
        ctx.fillStyle = colPrimary;
        ctx.font = `900 94px ${fontFam}`;
        ctx.fillText(line1Text, lx, -22);

        ctx.fillStyle = colAccent;
        ctx.font = `900 100px ${fontFam}`;
        ctx.fillText(line2Text, lx, 72);

        if (subText) {
            ctx.fillStyle = '#d4d4d8';
            ctx.font = `700 20px ${fontFam}`;
            ctx.fillText(subText, lx, 112);
        }

    } else if (style === 'cali_brutal_brackets') {
        // 08: Tactical Reticle + Slash Rule
        const w = 580, h = 220, b = 34;
        ctx.strokeStyle = colPrimary; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-w/2, -h/2 + b); ctx.lineTo(-w/2, -h/2); ctx.lineTo(-w/2 + b, -h/2);
        ctx.moveTo(w/2 - b, -h/2); ctx.lineTo(w/2, -h/2); ctx.lineTo(w/2, -h/2 + b);
        ctx.moveTo(-w/2, h/2 - b); ctx.lineTo(-w/2, h/2); ctx.lineTo(-w/2 + b, h/2);
        ctx.moveTo(w/2 - b, h/2); ctx.lineTo(w/2, h/2); ctx.lineTo(w/2, h/2 - b);
        ctx.stroke();

        if (badgeText) {
            ctx.fillStyle = colAccent;
            ctx.font = `800 22px 'JetBrains Mono', monospace`;
            ctx.fillText(`[ ${badgeText} ]`, 0, -76);
        }
        ctx.fillStyle = colPrimary;
        ctx.font = `900 84px ${fontFam}`;
        ctx.fillText(line1Text, 0, 4);

        ctx.fillStyle = colAccent;
        ctx.font = `900 84px ${fontFam}`;
        ctx.fillText(line2Text, 0, 82);

        ctx.fillStyle = colBadge;
        ctx.fillRect(-160, 96, 320, 7);

    } else if (style === 'cali_raw_cutout') {
        // 09: Grunge Label Tape Cutout
        ctx.font = `900 76px ${fontFam}`;
        const w1 = ctx.measureText(line1Text).width + 54;
        ctx.save();
        ctx.rotate(-2 * Math.PI / 180);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-w1 / 2, -105, w1, 84);
        ctx.fillStyle = colPrimary;
        ctx.fillText(line1Text, 0, -38);
        ctx.restore();

        ctx.font = `900 82px ${fontFam}`;
        const w2 = ctx.measureText(line2Text).width + 58;
        ctx.save();
        ctx.rotate(1.8 * Math.PI / 180);
        ctx.fillStyle = colBadge;
        ctx.fillRect(-w2 / 2, -12, w2, 88);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(line2Text, 0, 58);
        ctx.restore();

    } else if (style === 'cali_wod_board') {
        // 10: CrossFit WOD Scoreboard Card
        const w = 560, h = 230;
        ctx.fillStyle = 'rgba(12, 14, 18, 0.88)';
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 16); ctx.fill();
        ctx.fillStyle = colAccent;
        ctx.fillRect(-w / 2, -h / 2, 12, h);

        ctx.textAlign = 'left';
        const lx = -w / 2 + 38;
        ctx.fillStyle = colAccent;
        ctx.font = `800 22px ${fontFam}`;
        ctx.fillText(badgeText || 'WORKOUT OF THE DAY', lx, -h / 2 + 40);

        ctx.fillStyle = colPrimary;
        ctx.font = `900 74px ${fontFam}`;
        ctx.fillText(line1Text, lx, 16);

        ctx.fillStyle = colBadge;
        ctx.font = `900 68px ${fontFam}`;
        ctx.fillText(line2Text, lx, 82);

        if (subText) {
            ctx.fillStyle = '#a1a1aa';
            ctx.font = `700 18px 'JetBrains Mono', monospace`;
            ctx.fillText(subText, lx, h / 2 - 16);
        }

    // --- GROUP 3: AESTHETIC & MAGAZINE EDITORIAL ---
    } else if (style === 'mag_cover_masthead') {
        // 11: Magazine Cover Lower Callout (Masthead sudah digambar di atas)
        ctx.fillStyle = colAccent;
        ctx.font = `900 96px ${fontFam}`;
        ctx.fillText(line2Text, 0, 20);
        if (subText) {
            ctx.fillStyle = colPrimary;
            ctx.font = `800 24px ${fontFam}`;
            ctx.fillText(subText, 0, 65);
        }

    } else if (style === 'mag_minimal_luxury') {
        // 12: Clean Athletic Editorial
        if (badgeText) {
            ctx.fillStyle = colAccent;
            ctx.font = `700 20px 'Montserrat', sans-serif`;
            ctx.fillText(badgeText.split('').join(' '), 0, -105);
        }
        ctx.fillStyle = colPrimary;
        ctx.font = `900 82px ${fontFam}`;
        ctx.fillText(`${line1Text}  •  ${line2Text}`, 0, -15);

        ctx.fillStyle = colAccent;
        ctx.fillRect(-50, 12, 100, 4);

        if (subText) {
            ctx.fillStyle = '#d4d4d8';
            ctx.font = `600 20px 'Montserrat', sans-serif`;
            ctx.fillText(subText, 0, 50);
        }

    } else if (style === 'mag_glass_poster') {
        // 13: Frosted Glass Lower-Third
        const w = 590, h = 215;
        ctx.fillStyle = 'rgba(15, 20, 28, 0.78)';
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'; ctx.lineWidth = 2; ctx.stroke();

        if (badgeText) {
            ctx.fillStyle = colAccent;
            ctx.font = `800 20px ${fontFam}`;
            ctx.fillText(badgeText, 0, -h / 2 + 38);
        }
        ctx.fillStyle = colPrimary;
        ctx.font = `900 72px ${fontFam}`;
        ctx.fillText(line1Text, 0, 10);

        ctx.fillStyle = colAccent;
        ctx.font = `900 72px ${fontFam}`;
        ctx.fillText(line2Text, 0, 78);

    } else if (style === 'mag_diagonal_split') {
        // 14: Dynamic Angled Corner Slash
        ctx.beginPath();
        ctx.moveTo(-310, -110); ctx.lineTo(290, -145);
        ctx.lineTo(310, 95); ctx.lineTo(-290, 130);
        ctx.closePath();
        ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
        ctx.fill();
        ctx.strokeStyle = colAccent; ctx.lineWidth = 4; ctx.stroke();

        ctx.save();
        ctx.rotate(-3.2 * Math.PI / 180);
        ctx.fillStyle = colBadge;
        ctx.font = `800 22px ${fontFam}`;
        ctx.fillText(badgeText, 0, -72);

        ctx.fillStyle = colPrimary;
        ctx.font = `900 78px ${fontFam}`;
        ctx.fillText(line1Text, 0, 4);

        ctx.fillStyle = colAccent;
        ctx.font = `900 80px ${fontFam}`;
        ctx.fillText(line2Text, 0, 78);
        ctx.restore();

    // --- GROUP 4: CAMCORDER & TELEMETRY PROOF ---
    } else if (style === 'cam_rec_poster') {
        // 16: VHS Camcorder Center/Bottom Caption
        const vhsFont = "'VCR OSD Mono', monospace";
        ctx.textAlign = 'left';
        const lx = -270;

        if (badgeText) {
            ctx.fillStyle = colBadge;
            ctx.font = `700 28px ${vhsFont}`;
            ctx.fillText(`[ ${badgeText} ]`, lx, -82);
        }
        ctx.fillStyle = colPrimary;
        ctx.font = `700 68px ${vhsFont}`;
        ctx.fillText(line1Text, lx, -8);

        ctx.fillStyle = colAccent;
        ctx.font = `700 72px ${vhsFont}`;
        ctx.fillText(line2Text, lx, 68);

        if (subText) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `700 24px ${vhsFont}`;
            ctx.fillText(subText, lx, 114);
        }

    } else if (style === 'strava_stat_hero') {
        // 17: Strava Giant Metric Poster
        ctx.textAlign = 'left';
        const lx = -260;
        ctx.fillStyle = '#fc4c02';
        ctx.fillRect(lx - 26, -120, 10, 235);

        ctx.fillStyle = '#fc4c02';
        ctx.font = `800 24px ${fontFam}`;
        ctx.fillText(badgeText || 'STRAVA WORKOUT ACTIVITY', lx, -88);

        ctx.fillStyle = colPrimary;
        ctx.font = `900 92px ${fontFam}`;
        ctx.fillText(line1Text, lx, -2);

        ctx.fillStyle = colAccent;
        ctx.font = `900 88px ${fontFam}`;
        ctx.fillText(line2Text, lx, 82);

        if (subText) {
            ctx.fillStyle = '#d4d4d8';
            ctx.font = `700 22px ${fontFam}`;
            ctx.fillText(subText, lx, 118);
        }

    } else if (style === 'hud_target_lock') {
        // 18: Biometric Target Crosshair
        ctx.save();
        ctx.strokeStyle = hexToRgbaThumb(colAccent, 0.55);
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(0, -10, 135, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.arc(0, -10, 155, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(-185, -10); ctx.lineTo(-115, -10);
        ctx.moveTo(115, -10);  ctx.lineTo(185, -10);
        ctx.moveTo(0, -195);   ctx.lineTo(0, -125);
        ctx.moveTo(0, 105);    ctx.lineTo(0, 175);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = colAccent;
        ctx.font = `700 20px 'JetBrains Mono', monospace`;
        ctx.fillText(`SYS.LOCK // ${badgeText}`, 0, -92);

        ctx.fillStyle = colPrimary;
        ctx.font = `900 86px ${fontFam}`;
        ctx.fillText(line1Text, 0, -8);

        ctx.fillStyle = colAccent;
        ctx.font = `900 88px ${fontFam}`;
        ctx.fillText(line2Text, 0, 74);
    }

    ctx.restore();
}

// ============================================================================
// 3. HOOK KE PIPELINE RENDER APP.JS (MENDUKUNG FREEZE FRAME, GRIT & HIDE HUD)
// ============================================================================
const _baseDrawMediaForThumb = window.drawMediaWithPanZoom;
window.drawMediaWithPanZoom = function(ctx, media, mW, mH, cW, cH) {
    const thumbEnabled = document.getElementById('enableThumbMode')?.checked;
    const activeMedia  = (thumbEnabled && isThumbFrameFrozen && frozenFrameCanvas) ? frozenFrameCanvas : media;
    const activeW      = (thumbEnabled && isThumbFrameFrozen && frozenFrameCanvas) ? frozenFrameCanvas.width : mW;
    const activeH      = (thumbEnabled && isThumbFrameFrozen && frozenFrameCanvas) ? frozenFrameCanvas.height : mH;

    _baseDrawMediaForThumb(ctx, activeMedia, activeW, activeH, cW, cH);

    // Jika mode Thumbnail aktif dan ada tambahan Contrast Grit atau B&W Photo
    if (thumbEnabled) {
        const contrastBoost = parseFloat(document.getElementById('thumbContrastSlider')?.value || 0);
        const bwPhoto       = document.getElementById('thumbBwPhoto')?.checked;

        if (contrastBoost > 0.01 || bwPhoto) {
            ctx.save();
            const fParts = [];
            if (bwPhoto) fParts.push('grayscale(100%)');
            if (contrastBoost > 0.01) fParts.push(`contrast(${Math.round(100 + contrastBoost * 85)}%)`);
            ctx.filter = fParts.join(' ');
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = 'none';
            ctx.restore();
        }
    }
};

// Bungkus renderFrame agar dapat menyembunyikan HUD lain saat mendesain Thumbnail bersih
const _baseRenderFrameForThumb = window.renderFrame;
window.renderFrame = function() {
    const thumbEnabled = document.getElementById('enableThumbMode')?.checked;
    const hideOtherHud = document.getElementById('thumbHideOtherHud')?.checked;

    if (thumbEnabled && hideOtherHud) {
        const origHooks = window.overlayRenderHooks;
        window.overlayRenderHooks = [renderThumbnailOverlay];
        _baseRenderFrameForThumb();
        window.overlayRenderHooks = origHooks;
    } else {
        _baseRenderFrameForThumb();
    }
};

window.overlayRenderHooks.push(renderThumbnailOverlay);

// Drag & Drop Posisi Teks Thumbnail di Kanvas
canvas.addEventListener('mousedown', function(e) {
    if (!document.getElementById('enableThumbMode')?.checked) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const resFactor = Math.min(canvas.width, canvas.height) / 720;
    if (Math.hypot(mx - thumbPos.x, my - thumbPos.y) < 260 * resFactor) {
        isDraggingThumb = true;
        thumbDragOffset = { x: mx - thumbPos.x, y: my - thumbPos.y };
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isDraggingThumb) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    thumbPos = { x: Math.round(mx - thumbDragOffset.x), y: Math.round(my - thumbDragOffset.y) };
    renderFrame();
});

window.addEventListener('mouseup', () => { isDraggingThumb = false; });

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => snapThumbPosition('bottom'), 80);
});