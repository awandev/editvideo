/**
 * TIMELINE RANGE SELECTOR, CUT SPLICE & LOCAL REGION FX MODULE (WITH REGION EDIT & RESET)
 */

let cutSegments = [];   // Array of { id, start, end } -> Bagian yang dipotong
let fxRegions   = [];   // Array of { id, start, end, speed, lut, zoom } -> Pengaturan khusus (10x, LUT, dll)
let nextRegionId = 1;

// State Seleksi Rentang Waktu di Timeline
let selectionRange = null; // { start, end }
let isDraggingSelection = false;
let dragSelectionAnchor = 0;
let dragSelectionMode = 'new'; // 'new' | 'left' | 'right'
let loopSelectedRange = false;

let seekLockTarget = null;
let userBaseSpeed = 1.0;

// Simpan kecepatan global asli
const _origSetPlaybackSpeed = window.setPlaybackSpeed;
window.setPlaybackSpeed = function(spd, isInternalOverride = false) {
    if (!isInternalOverride) {
        userBaseSpeed = spd;
    }
    _origSetPlaybackSpeed(spd);
};

// ============================================================================
// 1. DETEKSI OVERLAP & KLIK BLOK YANG SUDAH ADA DI TIMELINE
// ============================================================================
function rangesOverlap(s1, e1, s2, e2) {
    return Math.max(s1, s2) < Math.min(e1, e2) - 0.05;
}

function getOverlappingRegions(startSec, endSec) {
    const cuts = cutSegments.filter(c => rangesOverlap(startSec, endSec, c.start, c.end));
    const fxs  = fxRegions.filter(f => rangesOverlap(startSec, endSec, f.start, f.end));
    return { cuts, fxs, hasAny: (cuts.length > 0 || fxs.length > 0) };
}

function secFromTimelineEvent(e) {
    const bar = document.getElementById('interactiveRegionBar');
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Number((ratio * trimEndTotalSec).toFixed(2));
}

// Pilih kembali region yang sudah dibuat (saat diklik di timeline atau di daftar kiri)
function selectExistingRegion(startSec, endSec, fxObj = null) {
    selectionRange = { start: startSec, end: endSec };
    onSliderChange(startSec);

    const spdSel  = document.getElementById('selRegionSpeed');
    const lutSel  = document.getElementById('selRegionLut');
    const zoomSel = document.getElementById('selRegionZoom');

    if (fxObj) {
        if (spdSel)  spdSel.value  = fxObj.speed ? String(fxObj.speed) : '';
        if (lutSel)  lutSel.value  = fxObj.lut || '';
        if (zoomSel) zoomSel.value = fxObj.zoom ? String(fxObj.zoom) : '';
    } else {
        if (spdSel)  spdSel.value  = '';
        if (lutSel)  lutSel.value  = '';
        if (zoomSel) zoomSel.value = '';
    }

    updateSelectionUI();
    renderCutTimelineTrack();
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
    const bar      = document.getElementById('selectionActionBar');
    const lbl      = document.getElementById('lblSelRangeInfo');
    const dot      = document.getElementById('selStatusDot');
    const btnLoop  = document.getElementById('btnLoopSelection');
    const btnReset = document.getElementById('btnResetRegionFx');
    const lblReset = document.getElementById('lblResetRegionBtn');
    if (!bar || !lbl) return;

    if (selectionRange && (selectionRange.end - selectionRange.start) >= 0.2) {
        bar.classList.remove('hidden');
        const dur = (selectionRange.end - selectionRange.start).toFixed(1);
        constov = getOverlappingRegions(selectionRange.start, selectionRange.end);

        // Jika area yang dipilih memiliki pengaturan Speed/FX/Cut, tampilkan tombol merah "Reset Setting"
        if (theov.hasAny) {
            if (btnReset) btnReset.classList.remove('hidden');
            if (theov.fxs.length > 0) {
                const fx = theov.fxs[0];
                const tags = [];
                if (fx.speed) tags.push(`${fx.speed}x`);
                if (fx.lut)   tags.push(fx.lut.toUpperCase());
                if (fx.zoom)  tags.push(`Zoom ${fx.zoom}x`);
                lbl.innerText = `${formatMMSS(selectionRange.start)} — ${formatMMSS(selectionRange.end)} [${tags.join(' • ')}]`;
                if (dot) dot.className = 'w-2 h-2 rounded-full bg-sky-400';
                if (lblReset) lblReset.innerText = 'Reset FX / Speed';
            } else {
                lbl.innerText = `${formatMMSS(selectionRange.start)} — ${formatMMSS(selectionRange.end)} [CUT AREA]`;
                if (dot) dot.className = 'w-2 h-2 rounded-full bg-red-500';
                if (lblReset) lblReset.innerText = 'Restore Cut';
            }
        } else {
            if (btnReset) btnReset.classList.add('hidden');
            lbl.innerText = `${formatMMSS(selectionRange.start)} — ${formatMMSS(selectionRange.end)} (${dur}s)`;
            if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400';
        }

        if (btnLoop) {
            btnLoop.className = loopSelectedRange
                ? 'bg-amber-500 text-zinc-950 font-semibold text-[11px] font-mono-tech px-2 py-1 rounded transition'
                : 'bg-[#18181c] hover:bg-[#222228] text-zinc-400 border border-[#27272a] text-[11px] font-mono-tech px-2 py-1 rounded transition';
        }
    } else {
        bar.classList.add('hidden');
    }
}

// Event Listener Drag-Select atau Klik Blok Eksisting pada Bar Timeline
window.addEventListener('DOMContentLoaded', () => {
    const regionBar = document.getElementById('interactiveRegionBar');
    if (!regionBar) return;

    regionBar.addEventListener('mousedown', function(e) {
        const clickedSec = secFromTimelineEvent(e);
        const toleranceSec = Math.max(0.5, trimEndTotalSec * 0.015);

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

        // Jika user hanya mengklik (bukan men-drag rentang baru), cek apakah klik mengenai blok FX atau Cut yang sudah ada
        if (selectionRange && (selectionRange.end - selectionRange.start) < 0.25) {
            const clickPt = selectionRange.start;
            const clickedFx  = fxRegions.find(r => clickPt >= r.start && clickPt <= r.end);
            const clickedCut = cutSegments.find(c => clickPt >= c.start && clickPt <= c.end);

            if (clickedFx) {
                selectExistingRegion(clickedFx.start, clickedFx.end, clickedFx);
                return;
            } else if (clickedCut) {
                selectExistingRegion(clickedCut.start, clickedCut.end, null);
                return;
            } else {
                selectionRange = null;
            }
        }
        updateSelectionUI();
        renderCutTimelineTrack();
    });
});

// ============================================================================
// 2. AKSI PADA AREA: CUT, TRIM, APPLY FX, & HAPUS / RESET PENGATURAN AREA
// ============================================================================

// Hapus / Batalkan semua pengaturan (Speed 10x, LUT, Zoom, atau Cut) pada area yang sedang dipilih
function resetSelectionSettings() {
    if (!selectionRange) return;
    const s = selectionRange.start;
    const e = selectionRange.end;

    // Hapus FX maupun Cut yang bersinggungan dengan area yang dipilih
    fxRegions   = fxRegions.filter(r => !rangesOverlap(s, e, r.start, r.end));
    cutSegments = cutSegments.filter(c => !rangesOverlap(s, e, c.start, c.end));

    // Kembalikan kecepatan ke normal (base speed)
    window.setPlaybackSpeed(userBaseSpeed, true);

    // Reset dropdown ke Default
    const spdSel  = document.getElementById('selRegionSpeed');
    const lutSel  = document.getElementById('selRegionLut');
    const zoomSel = document.getElementById('selRegionZoom');
    if (spdSel)  spdSel.value  = '';
    if (lutSel)  lutSel.value  = '';
    if (zoomSel) zoomSel.value = '';

    clearTimelineSelection();
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

function applyCutToSelection() {
    if (!selectionRange || (selectionRange.end - selectionRange.start) < 0.2) return;
    const s = selectionRange.start;
    const e = selectionRange.end;

    // Hapus FX di area yang sama agar tidak bentrok dengan Cut
    fxRegions = fxRegions.filter(r => !rangesOverlap(s, e, r.start, r.end));

    cutSegments.push({
        id: nextRegionId++,
        start: s,
        end: e
    });
    mergeOverlappingCuts();
    clearTimelineSelection();
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

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

function applyFxToSelection() {
    if (!selectionRange || (selectionRange.end - selectionRange.start) < 0.2) return;
    const spdVal  = document.getElementById('selRegionSpeed')?.value || '';
    const lutVal  = document.getElementById('selRegionLut')?.value || '';
    const zoomVal = document.getElementById('selRegionZoom')?.value || '';

    const s = selectionRange.start;
    const e = selectionRange.end;

    // Hapus FX lama di area yang bersinggungan agar tidak menumpuk duplikat
    fxRegions = fxRegions.filter(r => !rangesOverlap(s, e, r.start, r.end));

    // Jika semua disetel ke "Default" (kosong), berarti user ingin menghapus FX di area tersebut
    if (!spdVal && !lutVal && !zoomVal) {
        window.setPlaybackSpeed(userBaseSpeed, true);
        clearTimelineSelection();
        renderCutListUI();
        renderCutTimelineTrack();
        renderFrame();
        return;
    }

    fxRegions.push({
        id: nextRegionId++,
        start: s,
        end: e,
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
    updateSelectionUI();
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

function removeFxRegion(id) {
    fxRegions = fxRegions.filter(r => r.id !== id);
    window.setPlaybackSpeed(userBaseSpeed, true);
    updateSelectionUI();
    renderCutListUI();
    renderCutTimelineTrack();
    renderFrame();
}

function clearAllCutSegments() {
    cutSegments = [];
    fxRegions = [];
    window.setPlaybackSpeed(userBaseSpeed, true);
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
    if (badge) badge.innerText = `${totalRegions} active`;
    if (effDurLbl) effDurLbl.innerText = `Net Duration: ${formatMMSS(effectiveDur)}`;

    if (!container) return;
    if (totalRegions === 0) {
        container.innerHTML = `<div class="text-zinc-600 text-center py-2.5 text-[11px]">No active region settings. Drag on the timeline bar to select an area.</div>`;
        return;
    }

    const cutHtml = cutSegments.map(seg => {
        const dur = (seg.end - seg.start).toFixed(1);
        return `
            <div class="flex items-center justify-between bg-[#141418] px-2.5 py-1.5 rounded border border-red-900/40">
                <div class="flex items-center gap-2 font-mono-tech text-[11px]">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    <button type="button" onclick="selectExistingRegion(${seg.start}, ${seg.end}, null)" class="text-zinc-200 hover:text-orange-400 transition" title="Click to select on timeline">
                        ${formatMMSS(seg.start)}–${formatMMSS(seg.end)}
                    </button>
                    <span class="text-red-400 text-[10px]">CUT (-${dur}s)</span>
                </div>
                <button type="button" onclick="removeCutSegment(${seg.id})" class="text-zinc-400 hover:text-red-400 text-[10px] font-mono-tech bg-zinc-900 hover:bg-red-950/60 px-2 py-0.5 rounded border border-zinc-800 transition" title="Restore cut segment">
                    Reset ×
                </button>
            </div>
        `;
    }).join('');

    const fxHtml = fxRegions.map((reg, idx) => {
        const tags = [];
        if (reg.speed) tags.push(`${reg.speed}x`);
        if (reg.lut) tags.push(reg.lut.toUpperCase());
        if (reg.zoom) tags.push(`Z:${reg.zoom}x`);
        return `
            <div class="flex items-center justify-between bg-[#141418] px-2.5 py-1.5 rounded border border-sky-900/40">
                <div class="flex items-center gap-2 font-mono-tech text-[11px]">
                    <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                    <button type="button" onclick="selectExistingRegion(${reg.start}, ${reg.end}, fxRegions[${idx}])" class="text-zinc-200 hover:text-sky-400 transition" title="Click to edit or reset on timeline">
                        ${formatMMSS(reg.start)}–${formatMMSS(reg.end)}
                    </button>
                    <span class="text-sky-400 text-[10px]">${tags.join(' • ')}</span>
                </div>
                <button type="button" onclick="removeFxRegion(${reg.id})" class="text-zinc-400 hover:text-red-400 text-[10px] font-mono-tech bg-zinc-900 hover:bg-red-950/60 px-2 py-0.5 rounded border border-zinc-800 transition" title="Remove this speed/FX setting">
                    Reset ×
                </button>
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

    if (trimStartTotalSec > 0) {
        const wPct = Math.min(100, (trimStartTotalSec / maxSec) * 100);
        html += `<div style="left:0%; width:${wPct}%;" class="absolute inset-y-0 bg-zinc-800/80"></div>`;
    }

    // Area FX Regions (Biru/Cyan)
    fxRegions.forEach(reg => {
        const leftPct = Math.max(0, Math.min(100, (reg.start / maxSec) * 100));
        const widthPct = Math.max(0.4, Math.min(100 - leftPct, ((reg.end - reg.start) / maxSec) * 100));
        html += `<div style="left:${leftPct}%; width:${widthPct}%;" class="absolute inset-y-0 bg-sky-500/55 border-x border-sky-300"></div>`;
    });

    // Area Cut Segments (Merah)
    cutSegments.forEach(seg => {
        const leftPct = Math.max(0, Math.min(100, (seg.start / maxSec) * 100));
        const widthPct = Math.max(0.4, Math.min(100 - leftPct, ((seg.end - seg.start) / maxSec) * 100));
        html += `<div style="left:${leftPct}%; width:${widthPct}%;" class="absolute inset-y-0 bg-red-600/80 border-x border-red-400"></div>`;
    });

    // Area Active Selection (Kuning/Amber)
    if (selectionRange && (selectionRange.end - selectionRange.start) >= 0.05) {
        const leftPct = Math.max(0, Math.min(100, (selectionRange.start / maxSec) * 100));
        const widthPct = Math.max(0.4, Math.min(100 - leftPct, ((selectionRange.end - selectionRange.start) / maxSec) * 100));
        html += `<div style="left:${leftPct}%; width:${widthPct}%;" class="absolute inset-y-0 bg-amber-400/35 border-x-2 border-amber-400"></div>`;
    }

    track.innerHTML = html;
}

// ============================================================================
// 4. INTERCEPT PLAYBACK & RENDER
// ============================================================================
const _baseRenderFrame = window.renderFrame;
window.renderFrame = function() {
    if (isPlayingSim) {
        if (loopSelectedRange && selectionRange && currentVideoSec >= selectionRange.end) {
            currentVideoSec = selectionRange.start;
            if (useVideoBg) hiddenVideo.currentTime = selectionRange.start;
        }

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

// Keyboard Shortcuts: [I] In, [O] Out, [Delete] Reset/Hapus Pengaturan jika sudah ada FX, atau Cut jika belum ada FX
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
        const ov = getOverlappingRegions(selectionRange.start, selectionRange.end);
        if (ov.hasAny) {
            resetSelectionSettings();
        } else {
            applyCutToSelection();
        }
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