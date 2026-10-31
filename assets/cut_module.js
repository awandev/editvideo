/**
 * TIMELINE RANGE SELECTOR, CUT SPLICE & LOCAL REGION FX MODULE
 * Mendukung blok area timeline (Click & Drag atau In/Out) untuk Cut, Trim, Speed Ramp & LUT/Zoom FX
 */

let cutSegments = [];   // Array of { id, start, end } -> Bagian yang dihapus/dilewati
let fxRegions   = [];   // Array of { id, start, end, speed, lut, zoom } -> Efek khusus di menit tertentu
let nextRegionId = 1;

// State Seleksi Rentang Waktu di Timeline
let selectionRange = null; // { start, end }
let isDraggingSelection = false;
let dragSelectionAnchor = 0;
let dragSelectionMode = 'new'; // 'new' | 'left' | 'right'
let loopSelectedRange = false;

let seekLockTarget = null;
let userBaseSpeed = 1.0;

// Tangkap perubahan kecepatan global agar tahu kecepatan dasar saat keluar dari Region FX
const _origSetPlaybackSpeed = window.setPlaybackSpeed;
window.setPlaybackSpeed = function(spd, isInternalOverride = false) {
    if (!isInternalOverride) {
        userBaseSpeed = spd;
    }
    _origSetPlaybackSpeed(spd);
};

// ============================================================================
// 1. INTERACTIVE TIMELINE RANGE SELECTION (DRAG & IN/OUT)
// ============================================================================
function secFromTimelineEvent(e) {
    const bar = document.getElementById('interactiveRegionBar');
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Number((ratio * trimEndTotalSec).toFixed(2));
}

function setSelectionPoint(type) {
    const cur = Number(currentVideoSec.toFixed(2));
    if (!selectionRange) {
        if (type === 'in') {
            selectionRange = { start: cur, end: Math.min(trimEndTotalSec, cur + 10) };
        } else {
            selectionRange = { start: Math.max(trimStartTotalSec, cur - 10), end: cur };
        }
    } else {
        if (type === 'in') {
            selectionRange.start = Math.min(cur, selectionRange.end - 0.2);
        } else {
            selectionRange.end = Math.max(cur, selectionRange.start + 0.2);
        }
    }
    updateSelectionUI();
    renderCutTimelineTrack();
}

function clearTimelineSelection() {
    selectionRange = null;
    loopSelectedRange = false;
    updateSelectionUI();
    renderCutTimelineTrack();
}

function toggleLoopSelection() {
    loopSelectedRange = !loopSelectedRange;
    updateSelectionUI();
    if (loopSelectedRange && selectionRange) {
        onSliderChange(selectionRange.start);
        if (!isPlayingSim) togglePlaySim();
    }
}

function updateSelectionUI() {
    const bar = document.getElementById('selectionActionBar');
    const lbl = document.getElementById('lblSelRangeInfo');
    const btnLoop = document.getElementById('btnLoopSelection');
    if (!bar || !lbl) return;

    if (selectionRange && (selectionRange.end - selectionRange.start) >= 0.2) {
        bar.classList.remove('hidden');
        const dur = (selectionRange.end - selectionRange.start).toFixed(1);
        lbl.innerText = `${formatMMSS(selectionRange.start)} — ${formatMMSS(selectionRange.end)} (${dur}s)`;

        if (btnLoop) {
            btnLoop.className = loopSelectedRange
                ? 'bg-amber-500 text-zinc-950 font-semibold text-[11px] font-mono-tech px-2 py-1 rounded transition'
                : 'bg-[#18181c] hover:bg-[#222228] text-zinc-400 border border-[#27272a] text-[11px] font-mono-tech px-2 py-1 rounded transition';
        }
    } else {
        bar.classList.add('hidden');
    }
}

// Event Listener Drag-Select pada Bar Timeline
window.addEventListener('DOMContentLoaded', () => {
    const regionBar = document.getElementById('interactiveRegionBar');
    if (!regionBar) return;

    regionBar.addEventListener('mousedown', function(e) {
        const clickedSec = secFromTimelineEvent(e);
        const toleranceSec = Math.max(0.5, trimEndTotalSec * 0.015);

        // Cek apakah user men-drag tepi kiri atau tepi kanan seleksi yang sudah ada
        if (selectionRange && Math.abs(clickedSec - selectionRange.start) <= toleranceSec) {
            isDraggingSelection = true;
            dragSelectionMode = 'left';
        } else if (selectionRange && Math.abs(clickedSec - selectionRange.end) <= toleranceSec) {
            isDraggingSelection = true;
            dragSelectionMode = 'right';
        } else {
            isDraggingSelection = true;
            dragSelectionMode = 'new';
            dragSelectionAnchor = clickedSec;
            selectionRange = { start: clickedSec, end: clickedSec };
            onSliderChange(clickedSec);
        }
        updateSelectionUI();
        renderCutTimelineTrack();
    });

    window.addEventListener('mousemove', function(e) {
        if (!isDraggingSelection || !selectionRange) return;
        const curSec = secFromTimelineEvent(e);

        if (dragSelectionMode === 'new') {
            selectionRange.start = Math.min(dragSelectionAnchor, curSec);
            selectionRange.end   = Math.max(dragSelectionAnchor, curSec);
        } else if (dragSelectionMode === 'left') {
            selectionRange.start = Math.min(curSec, selectionRange.end - 0.2);
        } else if (dragSelectionMode === 'right') {
            selectionRange.end = Math.max(curSec, selectionRange.start + 0.2);
        }

        onSliderChange(curSec);
        updateSelectionUI();
        renderCutTimelineTrack();
    });

    window.addEventListener('mouseup', function() {
        if (!isDraggingSelection) return;
        isDraggingSelection = false;
        if (selectionRange && (selectionRange.end - selectionRange.start) < 0.25) {
            // Jika hanya diklik sekali tanpa digeser, batalkan blok dan pindahkan playhead saja
            selectionRange = null;
        }
        updateSelectionUI();
        renderCutTimelineTrack();
    });
});

// ============================================================================
// 2. AKSI PADA AREA YANG DIPILIH (CUT, TRIM, SPEED RAMP, LOCAL LUT/ZOOM)
// ============================================================================

// Aksi 1: Potong / Hilangkan Area yang Diblok
function applyCutToSelection() {
    if (!selectionRange || (selectionRange.end - selectionRange.start) < 0.2) return;
    cutSegments.push({
        id: nextRegionId++,
        start: selectionRange.start,
        end: selectionRange.end
    });
    mergeOverlappingCuts();
    clearTimelineSelection();
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

// Aksi 2: Trim Video Hanya ke Area yang Diblok
function applyTrimToSelection() {
    if (!selectionRange || (selectionRange.end - selectionRange.start) < 1) return;
    const s = Math.floor(selectionRange.start);
    const e = Math.ceil(selectionRange.end);

    document.getElementById('trimStartMin').value = Math.floor(s / 60);
    document.getElementById('trimStartSec').value = s % 60;
    document.getElementById('trimEndMin').value   = Math.floor(e / 60);
    document.getElementById('trimEndSec').value   = e % 60;

    clearTimelineSelection();
    updateTiming();
    jumpToTrimStart();
}

// Aksi 3: Terapkan Efek Lokal (Speed / LUT / Zoom) pada Area yang Diblok
function applyFxToSelection() {
    if (!selectionRange || (selectionRange.end - selectionRange.start) < 0.2) return;
    const spdVal  = document.getElementById('selRegionSpeed')?.value || '';
    const lutVal  = document.getElementById('selRegionLut')?.value || '';
    const zoomVal = document.getElementById('selRegionZoom')?.value || '';

    if (!spdVal && !lutVal && !zoomVal) return;

    fxRegions.push({
        id: nextRegionId++,
        start: selectionRange.start,
        end: selectionRange.end,
        speed: spdVal ? parseFloat(spdVal) : null,
        lut: lutVal || null,
        zoom: zoomVal ? parseFloat(zoomVal) : null
    });

    fxRegions.sort((a, b) => a.start - b.start);
    clearTimelineSelection();
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

function mergeOverlappingCuts() {
    if (cutSegments.length <= 1) return;
    cutSegments.sort((a, b) => a.start - b.start);
    const merged = [cutSegments[0]];
    for (let i = 1; i < cutSegments.length; i++) {
        const last = merged[merged.length - 1];
        const cur = cutSegments[i];
        if (cur.start <= last.end + 0.05) {
            last.end = Math.max(last.end, cur.end);
        } else {
            merged.push(cur);
        }
    }
    cutSegments = merged;
}

function removeCutSegment(id) {
    cutSegments = cutSegments.filter(s => s.id !== id);
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

function removeFxRegion(id) {
    fxRegions = fxRegions.filter(r => r.id !== id);
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

function clearAllCutSegments() {
    cutSegments = [];
    fxRegions = [];
    clearTimelineSelection();
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

function getActiveCutSegment(sec) {
    for (let i = 0; i < cutSegments.length; i++) {
        const seg = cutSegments[i];
        if (sec >= seg.start && sec < seg.end - 0.02) return seg;
    }
    return null;
}

function getActiveFxRegion(sec) {
    for (let i = fxRegions.length - 1; i >= 0; i--) {
        const reg = fxRegions[i];
        if (sec >= reg.start && sec <= reg.end) return reg;
    }
    return null;
}

function getCutDurationBefore(sec) {
    let totalCut = 0;
    for (const seg of cutSegments) {
        if (sec >= seg.end) totalCut += (seg.end - seg.start);
        else if (sec > seg.start) totalCut += (sec - seg.start);
    }
    return totalCut;
}

// ============================================================================
// 3. RENDER VISUALISASI TIMELINE & DAFTAR REGION DI PANEL KIRI
// ============================================================================
function renderCutListUI() {
    const container = document.getElementById('cutSegmentsList');
    const badge = document.getElementById('lblCutCountBadge');
    const effDurLbl = document.getElementById('lblEffectiveDuration');

    const totalRaw = Math.max(0, trimEndTotalSec - trimStartTotalSec);
    const totalRemoved = cutSegments.reduce((acc, s) => acc + (s.end - s.start), 0);
    const effectiveDur = Math.max(0, totalRaw - totalRemoved);

    const totalRegions = cutSegments.length + fxRegions.length;
    if (badge) badge.innerText = `${totalRegions} regions`;
    if (effDurLbl) effDurLbl.innerText = `Net Duration: ${formatMMSS(effectiveDur)}`;

    if (!container) return;
    if (totalRegions === 0) {
        container.innerHTML = `<div class="text-zinc-600 text-center py-2.5 text-[11px]">Drag on the timeline bar or press [I] & [O] to select a range for Cut, Trim, Speed, or FX.</div>`;
        return;
    }

    const cutHtml = cutSegments.map(seg => {
        const dur = (seg.end - seg.start).toFixed(1);
        return `
            <div class="flex items-center justify-between bg-[#141418] px-2.5 py-1.5 rounded border border-red-900/40">
                <div class="flex items-center gap-2 font-mono-tech text-[11px]">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    <button type="button" onclick="onSliderChange(${Math.max(0, seg.start - 0.5)})" class="text-zinc-200 hover:text-orange-400 transition">
                        ${formatMMSS(seg.start)}–${formatMMSS(seg.end)}
                    </button>
                    <span class="text-red-400 text-[10px]">CUT (-${dur}s)</span>
                </div>
                <button type="button" onclick="removeCutSegment(${seg.id})" class="text-zinc-500 hover:text-red-400 text-xs font-mono-tech px-1" title="Remove">×</button>
            </div>
        `;
    }).join('');

    const fxHtml = fxRegions.map(reg => {
        const tags = [];
        if (reg.speed) tags.push(`${reg.speed}x`);
        if (reg.lut) tags.push(reg.lut.toUpperCase());
        if (reg.zoom) tags.push(`Z:${reg.zoom}x`);
        return `
            <div class="flex items-center justify-between bg-[#141418] px-2.5 py-1.5 rounded border border-sky-900/40">
                <div class="flex items-center gap-2 font-mono-tech text-[11px]">
                    <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                    <button type="button" onclick="onSliderChange(${reg.start})" class="text-zinc-200 hover:text-sky-400 transition">
                        ${formatMMSS(reg.start)}–${formatMMSS(reg.end)}
                    </button>
                    <span class="text-sky-400 text-[10px]">${tags.join(' • ')}</span>
                </div>
                <button type="button" onclick="removeFxRegion(${reg.id})" class="text-zinc-500 hover:text-red-400 text-xs font-mono-tech px-1" title="Remove">×</button>
            </div>
        `;
    }).join('');

    container.innerHTML = cutHtml + fxHtml;
}

function renderCutTimelineTrack() {
    const track = document.getElementById('visualCutTrack');
    if (!track) return;
    const maxSec = Math.max(1, trimEndTotalSec);
    let html = '';

    // Area In-Point Trim
    if (trimStartTotalSec > 0) {
        const wPct = Math.min(100, (trimStartTotalSec / maxSec) * 100);
        html += `<div style="left:0%; width:${wPct}%;" class="absolute inset-y-0 bg-zinc-800/80"></div>`;
    }

    // Area FX Regions (Biru/Cyan)
    fxRegions.forEach(reg => {
        const leftPct = Math.max(0, Math.min(100, (reg.start / maxSec) * 100));
        const widthPct = Math.max(0.4, Math.min(100 - leftPct, ((reg.end - reg.start) / maxSec) * 100));
        html += `<div style="left:${leftPct}%; width:${widthPct}%;" class="absolute inset-y-0 bg-sky-500/50 border-x border-sky-400"></div>`;
    });

    // Area Cut Segments (Merah)
    cutSegments.forEach(seg => {
        const leftPct = Math.max(0, Math.min(100, (seg.start / maxSec) * 100));
        const widthPct = Math.max(0.4, Math.min(100 - leftPct, ((seg.end - seg.start) / maxSec) * 100));
        html += `<div style="left:${leftPct}%; width:${widthPct}%;" class="absolute inset-y-0 bg-red-600/80 border-x border-red-400"></div>`;
    });

    // Area Active Selection (Kuning/Amber dengan Handle Kiri & Kanan)
    if (selectionRange && (selectionRange.end - selectionRange.start) >= 0.05) {
        const leftPct = Math.max(0, Math.min(100, (selectionRange.start / maxSec) * 100));
        const widthPct = Math.max(0.4, Math.min(100 - leftPct, ((selectionRange.end - selectionRange.start) / maxSec) * 100));
        html += `
            <div style="left:${leftPct}%; width:${widthPct}%;" class="absolute inset-y-0 bg-amber-400/35 border-x-2 border-amber-400"></div>
        `;
    }

    track.innerHTML = html;
}

// ============================================================================
// 4. INTERCEPT PLAYBACK & RENDER (AUTO-SKIP CUTS + APPLY LOCAL SPEED/LUT/ZOOM)
// ============================================================================
const _baseRenderFrame = window.renderFrame;
window.renderFrame = function() {
    if (isPlayingSim) {
        // 1. Jika mode Loop Selection aktif, ulangi di dalam batas seleksi
        if (loopSelectedRange && selectionRange && currentVideoSec >= selectionRange.end) {
            currentVideoSec = selectionRange.start;
            if (useVideoBg) hiddenVideo.currentTime = selectionRange.start;
        }

        // 2. Auto-Skip jika masuk ke Cut Segment
        if (seekLockTarget !== null) {
            if (useVideoBg && hiddenVideo.currentTime < seekLockTarget - 0.05) {
                currentVideoSec = seekLockTarget;
            } else {
                seekLockTarget = null;
            }
        }

        const activeCut = getActiveCutSegment(currentVideoSec);
        if (activeCut) {
            currentVideoSec = activeCut.end;
            seekLockTarget = activeCut.end;
            if (useVideoBg) hiddenVideo.currentTime = activeCut.end;
            const slider = document.getElementById('timelineSlider');
            if (slider) slider.value = currentVideoSec;
        }
    }

    // 3. Cek apakah detik saat ini berada di dalam Region FX (Speed / LUT / Zoom Lokal)
    const activeFx = getActiveFxRegion(currentVideoSec);
    const targetSpeed = (activeFx && activeFx.speed) ? activeFx.speed : userBaseSpeed;
    if (playbackSpeed !== targetSpeed) {
        window.setPlaybackSpeed(targetSpeed, true);
    }

    const lutSelect = document.getElementById('lutPresetSelect');
    const zoomSlider = document.getElementById('camZoom');
    const origLut = lutSelect ? lutSelect.value : null;
    const origZoom = zoomSlider ? zoomSlider.value : null;

    if (activeFx) {
        if (activeFx.lut && lutSelect) lutSelect.value = activeFx.lut;
        if (activeFx.zoom && zoomSlider) zoomSlider.value = activeFx.zoom;
    }

    // 4. Hitung waktu Timer jika opsi Freeze Timer on Cuts aktif
    const deductTimer = document.getElementById('deductCutFromTimer')?.checked;
    const realVideoSec = currentVideoSec;

    if (deductTimer && cutSegments.length > 0) {
        const cutOffset = getCutDurationBefore(realVideoSec);
        currentVideoSec = Math.max(trimStartTotalSec, realVideoSec - cutOffset);
        _baseRenderFrame();
        currentVideoSec = realVideoSec;
        document.getElementById('lblVideoTime').innerText = formatMMSS(realVideoSec);
    } else {
        _baseRenderFrame();
    }

    // Kembalikan nilai kontrol global setelah frame selesai digambar
    if (activeFx) {
        if (origLut !== null && lutSelect) lutSelect.value = origLut;
        if (origZoom !== null && zoomSlider) zoomSlider.value = origZoom;
    }
};

const _baseUpdateTiming = window.updateTiming;
window.updateTiming = function() {
    _baseUpdateTiming();
    renderCutListUI();
    renderCutTimelineTrack();
};

// Keyboard Shortcuts: [I] In, [O] Out, [Delete] Cut Selection, [Esc] Clear Selection
window.addEventListener('keydown', function(e) {
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.code === 'KeyI' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setSelectionPoint('in');
    } else if (e.code === 'KeyO' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setSelectionPoint('out');
    } else if (e.code === 'Delete' && selectionRange) {
        e.preventDefault();
        applyCutToSelection();
    } else if (e.code === 'Escape' && selectionRange) {
        e.preventDefault();
        clearTimelineSelection();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderCutListUI();
        renderCutTimelineTrack();
    }, 60);
});