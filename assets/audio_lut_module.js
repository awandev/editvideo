/**
 * AUDIO MIXER & 20 WORKOUT LUT COLOR GRADING MODULE (FULL VERSION)
 */

const bgmAudio = document.getElementById('bgmAudio');

let audioCtx = null;
let audioDest = null;
let videoSourceNode = null;
let bgmSourceNode = null;
let videoGainNode = null;
let bgmGainNode = null;
let sfxGainNode = null;
let hasBgmLoaded = false;

let customCubeLut = null;
let lastAudioRepCount = 0;

if (typeof modalTitles !== 'undefined') {
    modalTitles.audio_lut = 'Color LUT & Audio Mixer';
}

// ============================================================================
// DATABASE 20 MODEL LUT WORKOUT (TERKELOMPOK 4 KATEGORI)
// ============================================================================
const WORKOUT_LUT_DATABASE = {
    // GROUP 1: HARDCORE & MUSCLE GRIT
    bleach_grit: {
        name: '01 Bleach Grit',
        contrast: 46, saturate: -55, brightness: -8, sepia: 0, grayscale: 0, hue: 0,
        blend: 'soft-light', c1: [20, 28, 36, 0.35], c2: [10, 12, 16, 0.45], vignette: 0.55
    },
    iron_shadow: {
        name: '02 Dark Iron',
        contrast: 38, saturate: -22, brightness: -12, sepia: 0, grayscale: 0, hue: 0,
        blend: 'overlay', c1: [30, 35, 42, 0.30], c2: [5, 7, 10, 0.50], vignette: 0.50
    },
    spartan_bronze: {
        name: '03 Spartan Bronze',
        contrast: 34, saturate: -15, brightness: -6, sepia: 38, grayscale: 0, hue: -5,
        blend: 'soft-light', c1: [215, 135, 55, 0.38], c2: [35, 20, 10, 0.48], vignette: 0.48
    },
    concrete_raw: {
        name: '04 Concrete Raw',
        contrast: 24, saturate: -38, brightness: -4, sepia: 6, grayscale: 0, hue: 0,
        blend: 'soft-light', c1: [120, 128, 135, 0.25], c2: [28, 32, 36, 0.30], vignette: 0.32
    },
    adrenaline_punch: {
        name: '05 Adrenaline HDR',
        contrast: 32, saturate: 28, brightness: 2, sepia: 0, grayscale: 0, hue: -2,
        blend: 'overlay', c1: [255, 110, 40, 0.16], c2: [15, 25, 45, 0.22], vignette: 0.35
    },

    // GROUP 2: CINEMATIC & COMMERCIAL GYM
    teal_orange: {
        name: '06 Teal & Orange',
        contrast: 22, saturate: 28, brightness: -3, sepia: 0, grayscale: 0, hue: 0,
        blend: 'overlay', c1: [255, 135, 50, 0.25], c2: [0, 145, 180, 0.32], vignette: 0.28
    },
    nike_commercial: {
        name: '07 Pro Commercial',
        contrast: 18, saturate: 16, brightness: 6, sepia: 0, grayscale: 0, hue: 0,
        blend: 'soft-light', c1: [240, 248, 255, 0.22], c2: [20, 50, 90, 0.18], vignette: 0.15
    },
    moody_dark: {
        name: '08 Moody Dark',
        contrast: 30, saturate: -26, brightness: -15, sepia: 0, grayscale: 0, hue: 0,
        blend: 'soft-light', c1: [40, 48, 58, 0.25], c2: [8, 10, 14, 0.55], vignette: 0.60
    },
    cyber_neon: {
        name: '09 Neon Night Gym',
        contrast: 26, saturate: 36, brightness: -4, sepia: 0, grayscale: 0, hue: -8,
        blend: 'screen', c1: [236, 72, 153, 0.18], c2: [6, 182, 212, 0.22], vignette: 0.40
    },
    anamorphic_blue: {
        name: '10 Cobalt Anamorphic',
        contrast: 24, saturate: -12, brightness: -5, sepia: 0, grayscale: 0, hue: -10,
        blend: 'soft-light', c1: [180, 215, 255, 0.20], c2: [12, 55, 130, 0.42], vignette: 0.38
    },

    // GROUP 3: OUTDOOR & STREET CALISTHENICS
    golden_hour: {
        name: '11 Golden Hour',
        contrast: 14, saturate: 32, brightness: 3, sepia: 24, grayscale: 0, hue: -4,
        blend: 'soft-light', c1: [255, 175, 55, 0.35], c2: [180, 75, 20, 0.22], vignette: 0.20
    },
    tropical_calisthenics: {
        name: '12 Tropical Sun',
        contrast: 18, saturate: 38, brightness: 5, sepia: 4, grayscale: 0, hue: 3,
        blend: 'overlay', c1: [255, 210, 90, 0.18], c2: [16, 165, 130, 0.18], vignette: 0.12
    },
    urban_street: {
        name: '13 Urban Asphalt',
        contrast: 26, saturate: -20, brightness: -2, sepia: 0, grayscale: 0, hue: -6,
        blend: 'soft-light', c1: [235, 165, 110, 0.22], c2: [35, 55, 75, 0.34], vignette: 0.30
    },
    high_noon: {
        name: '14 Harsh Sun Recovery',
        contrast: -14, saturate: 10, brightness: 4, sepia: 6, grayscale: 0, hue: 0,
        blend: 'soft-light', c1: [245, 225, 200, 0.25], c2: [60, 75, 95, 0.20], vignette: 0.10
    },
    morning_mist: {
        name: '15 Crisp Morning',
        contrast: 12, saturate: 8, brightness: 6, sepia: 0, grayscale: 0, hue: -6,
        blend: 'soft-light', c1: [210, 240, 255, 0.28], c2: [45, 100, 140, 0.22], vignette: 0.15
    },

    // GROUP 4: MONOCHROME & RETRO CAMCORDER
    bw_noir: {
        name: '16 Silver Noir B&W',
        contrast: 45, saturate: 0, brightness: -6, sepia: 0, grayscale: 100, hue: 0,
        blend: 'overlay', c1: [255, 255, 255, 0.12], c2: [0, 0, 0, 0.35], vignette: 0.52
    },
    bw_matte: {
        name: '17 Carbon Matte B&W',
        contrast: 12, saturate: 0, brightness: 6, sepia: 8, grayscale: 100, hue: 0,
        blend: 'screen', c1: [38, 38, 42, 0.28], c2: [28, 28, 32, 0.28], vignette: 0.25
    },
    bw_red_filter: {
        name: '18 Titanium B&W',
        contrast: 55, saturate: 0, brightness: 4, sepia: 4, grayscale: 100, hue: 0,
        blend: 'soft-light', c1: [255, 250, 245, 0.25], c2: [10, 10, 12, 0.45], vignette: 0.45
    },
    vhs_camcorder: {
        name: '19 90s Camcorder VHS',
        contrast: 8, saturate: -18, brightness: 4, sepia: 18, grayscale: 0, hue: 4,
        blend: 'screen', c1: [45, 32, 55, 0.22], c2: [25, 42, 38, 0.20], vignette: 0.28
    },
    kodachrome: {
        name: '20 Kodachrome 64',
        contrast: 22, saturate: 18, brightness: 0, sepia: 32, grayscale: 0, hue: -5,
        blend: 'soft-light', c1: [255, 180, 75, 0.28], c2: [90, 30, 25, 0.26], vignette: 0.32
    }
};

// ============================================================================
// 1. WEB AUDIO API MIXER & SYNTHESIZER ENGINE
// ============================================================================
window.initAudioMixer = function() {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    audioDest = audioCtx.createMediaStreamDestination();

    videoGainNode = audioCtx.createGain();
    bgmGainNode   = audioCtx.createGain();
    sfxGainNode   = audioCtx.createGain();
    window.updateAudioVolumes();

    if (typeof hiddenVideo !== 'undefined' && hiddenVideo) {
        try {
            videoSourceNode = audioCtx.createMediaElementSource(hiddenVideo);
            videoSourceNode.connect(videoGainNode);
            videoGainNode.connect(audioCtx.destination);
            videoGainNode.connect(audioDest);
        } catch (e) {}
    }

    if (bgmAudio) {
        try {
            bgmSourceNode = audioCtx.createMediaElementSource(bgmAudio);
            bgmSourceNode.connect(bgmGainNode);
            bgmGainNode.connect(audioCtx.destination);
            bgmGainNode.connect(audioDest);
        } catch (e) {}
    }

    sfxGainNode.connect(audioCtx.destination);
    sfxGainNode.connect(audioDest);
};

window.updateAudioVolumes = function() {
    const vVol = parseFloat(document.getElementById('videoVolSlider')?.value ?? 0.8);
    const bVol = parseFloat(document.getElementById('bgmVolSlider')?.value ?? 0.6);
    const sVol = parseFloat(document.getElementById('sfxVolSlider')?.value ?? 0.5);

    const lblV = document.getElementById('lblVidVol');
    const lblB = document.getElementById('lblBgmVol');
    const lblS = document.getElementById('lblSfxVol');

    if (lblV) lblV.innerText = Math.round(vVol * 100) + '%';
    if (lblB) lblB.innerText = Math.round(bVol * 100) + '%';
    if (lblS) lblS.innerText = Math.round(sVol * 100) + '%';

    if (videoGainNode && audioCtx) videoGainNode.gain.setValueAtTime(vVol, audioCtx.currentTime);
    if (bgmGainNode && audioCtx)   bgmGainNode.gain.setValueAtTime(bVol, audioCtx.currentTime);
    if (sfxGainNode && audioCtx)   sfxGainNode.gain.setValueAtTime(sVol, audioCtx.currentTime);
};

window.playSfxBeep = function(freq = 880, duration = 0.11, type = 'sine') {
    if (!document.getElementById('enableRepBeep')?.checked) return;
    window.initAudioMixer();
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, audioCtx.currentTime + duration);

    env.gain.setValueAtTime(0.4, audioCtx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(env);
    env.connect(sfxGainNode);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

window.playRoundBellSfx = function() {
    if (!document.getElementById('enableRepBeep')?.checked) return;
    window.playSfxBeep(587.33, 0.35, 'triangle');
    setTimeout(() => window.playSfxBeep(880, 0.45, 'triangle'), 120);
};

document.getElementById('bgmFileInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file || !bgmAudio) return;
    window.initAudioMixer();
    bgmAudio.src = URL.createObjectURL(file);
    hasBgmLoaded = true;
    const lblName = document.getElementById('lblBgmFileName');
    const lblStat = document.getElementById('lblBgmStatus');
    if (lblName) lblName.innerText = file.name;
    if (lblStat) lblStat.innerText = 'Ready';
});

// ============================================================================
// 2. ENGINE RENDER 20 PRESET LUT + CUSTOM 3D .CUBE PARSER
// ============================================================================
window.onLutPresetChange = function() {
    const val = document.getElementById('lutPresetSelect')?.value || 'none';
    const lbl = document.getElementById('lblLutStatus');
    if (lbl) {
        if (val === 'none') lbl.innerText = 'Rec.709 Standard';
        else if (WORKOUT_LUT_DATABASE[val]) lbl.innerText = WORKOUT_LUT_DATABASE[val].name;
        else lbl.innerText = val.toUpperCase();
    }
    renderFrame();
};

window.loadCubeLutFile = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split(/\r?\n/);
        let size = 0;
        const rgbValues = [];
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;
            if (line.startsWith('LUT_3D_SIZE')) {
                size = parseInt(line.split(/\s+/)[1], 10);
                continue;
            }
            if (/^[A-Za-z]/.test(line)) continue;
            const parts = line.split(/\s+/);
            if (parts.length >= 3) {
                const r = parseFloat(parts[0]), g = parseFloat(parts[1]), b = parseFloat(parts[2]);
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) rgbValues.push(r, g, b);
            }
        }
        if (size > 1 && rgbValues.length >= size * size * size * 3) {
            customCubeLut = { size, data: new Float32Array(rgbValues) };
            document.getElementById('lutPresetSelect').value = 'custom_cube';
            document.getElementById('lblCubeFileName').innerText = file.name;
            document.getElementById('lblLutStatus').innerText = `3D LUT (${size}³)`;
            renderFrame();
        } else {
            alert('Format file .CUBE tidak valid.');
        }
    };
    reader.readAsText(file);
};

window.drawMediaWithPanZoom = function(ctx, media, mW, mH, cW, cH) {
    const preset    = document.getElementById('lutPresetSelect')?.value || 'none';
    const intensity = parseFloat(document.getElementById('lutIntensitySlider')?.value ?? 0.85);
    const camZoom   = parseFloat(document.getElementById('camZoom')?.value || 1.0);
    const camPanX   = parseFloat(document.getElementById('camPanX')?.value || 0);
    const camPanY   = parseFloat(document.getElementById('camPanY')?.value || 0);

    const cfg = WORKOUT_LUT_DATABASE[preset] || null;

    ctx.save();

    // 1. Terapkan Base Filter (Contrast, Saturation, Brightness, Grayscale, Sepia, Hue)
    if (cfg && intensity > 0.01) {
        const filters = [];
        if (cfg.grayscale)  filters.push(`grayscale(${Math.round(cfg.grayscale * intensity)}%)`);
        if (cfg.sepia)      filters.push(`sepia(${Math.round(cfg.sepia * intensity)}%)`);
        if (cfg.contrast)   filters.push(`contrast(${Math.round(100 + cfg.contrast * intensity)}%)`);
        if (cfg.saturate)   filters.push(`saturate(${Math.round(100 + cfg.saturate * intensity)}%)`);
        if (cfg.brightness) filters.push(`brightness(${Math.round(100 + cfg.brightness * intensity)}%)`);
        if (cfg.hue)        filters.push(`hue-rotate(${Math.round(cfg.hue * intensity)}deg)`);
        if (filters.length > 0) ctx.filter = filters.join(' ');
    }

    const baseScale = Math.max(cW / mW, cH / mH) * camZoom;
    const dW = mW * baseScale;
    const dH = mH * baseScale;
    const dx = ((cW - dW) / 2) + camPanX;
    const dy = ((cH - dH) / 2) + camPanY;

    ctx.drawImage(media, dx, dy, dW, dH);
    ctx.filter = 'none';

    // 2. Jika menggunakan File .CUBE Eksternal
    if (preset === 'custom_cube' && customCubeLut && intensity > 0.01) {
        try {
            const imgData = ctx.getImageData(0, 0, cW, cH);
            const px = imgData.data;
            const sz = customCubeLut.size, inv255 = (sz - 1) / 255, lut = customCubeLut.data;
            for (let i = 0; i < px.length; i += 4) {
                const rIdx = Math.round(px[i] * inv255), gIdx = Math.round(px[i+1] * inv255), bIdx = Math.round(px[i+2] * inv255);
                const off = ((bIdx * sz * sz) + (gIdx * sz) + rIdx) * 3;
                px[i]   += (lut[off]*255 - px[i]) * intensity;
                px[i+1] += (lut[off+1]*255 - px[i+1]) * intensity;
                px[i+2] += (lut[off+2]*255 - px[i+2]) * intensity;
            }
            ctx.putImageData(imgData, 0, 0);
        } catch (err) {}
    }

    // 3. Terapkan Split-Toning (Highlight/Shadow Color Matrix) & Vignette Sinematik
    if (cfg && intensity > 0.01) {
        if (cfg.blend && cfg.c1 && cfg.c2) {
            ctx.save();
            ctx.globalCompositeOperation = cfg.blend;
            const grad = ctx.createLinearGradient(0, 0, cW, cH);
            grad.addColorStop(0, `rgba(${cfg.c1[0]}, ${cfg.c1[1]}, ${cfg.c1[2]}, ${(cfg.c1[3] * intensity).toFixed(3)})`);
            grad.addColorStop(1, `rgba(${cfg.c2[0]}, ${cfg.c2[1]}, ${cfg.c2[2]}, ${(cfg.c2[3] * intensity).toFixed(3)})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, cW, cH);
            ctx.restore();
        }

        if (cfg.vignette && cfg.vignette > 0) {
            ctx.save();
            const rad = ctx.createRadialGradient(cW / 2, cH / 2, Math.min(cW, cH) * 0.28, cW / 2, cH / 2, Math.max(cW, cH) * 0.72);
            rad.addColorStop(0, 'rgba(0,0,0,0)');
            rad.addColorStop(1, `rgba(0,0,0,${(cfg.vignette * intensity).toFixed(3)})`);
            ctx.fillStyle = rad;
            ctx.fillRect(0, 0, cW, cH);
            ctx.restore();
        }
    }

    ctx.restore();
};

// ============================================================================
// 3. HOOK KE WORKOUT COUNTER, PLAYBACK & MP4 RECORDER (60 FPS HIGH BITRATE)
// ============================================================================
window.overlayRenderHooks.push(function() {
    if (typeof getCountsAtTime === 'function') {
        const workoutElapsedSec = Math.max(0, currentVideoSec - trimStartTotalSec);
        const counts = getCountsAtTime(workoutElapsedSec);
        if (isPlayingSim && counts.totalReps > lastAudioRepCount) {
            window.playSfxBeep(880, 0.10);
        }
        lastAudioRepCount = counts.totalReps;
    }
});

if (typeof window.markRepNow === 'function') {
    const _origMarkRepNow = window.markRepNow;
    window.markRepNow = function(forcedExIdx = null) {
        const prevCount = typeof repEvents !== 'undefined' ? repEvents.length : 0;
        const prevRounds = typeof roundTimestamps !== 'undefined' ? roundTimestamps.length : 0;
        _origMarkRepNow(forcedExIdx);
        if (typeof roundTimestamps !== 'undefined' && roundTimestamps.length > prevRounds) {
            window.playRoundBellSfx();
        } else if (typeof repEvents !== 'undefined' && repEvents.length > prevCount) {
            window.playSfxBeep(880, 0.11);
        }
    };
}

if (typeof window.markRoundNow === 'function') {
    const _origMarkRoundNow = window.markRoundNow;
    window.markRoundNow = function() {
        _origMarkRoundNow();
        window.playRoundBellSfx();
    };
}

if (typeof window.togglePlaySim === 'function') {
    const _origTogglePlaySim = window.togglePlaySim;
    window.togglePlaySim = function() {
        window.initAudioMixer();
        _origTogglePlaySim();
        if (hasBgmLoaded && bgmAudio) {
            if (isPlayingSim) {
                const bgmStart = parseFloat(document.getElementById('bgmOffsetSec')?.value || 0);
                if (bgmAudio.paused) {
                    bgmAudio.currentTime = bgmStart;
                    bgmAudio.play().catch(() => {});
                }
            } else {
                bgmAudio.pause();
            }
        }
    };
}

function detectBestCodec() {
    const candidates = [
        'video/mp4;codecs=avc1.640033,mp4a.40.2',
        'video/mp4;codecs=avc1.64002A,mp4a.40.2',
        'video/mp4;codecs=avc1.64002A',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=h264',
        'video/webm'
    ];
    for (const type of candidates) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return '';
}

window.toggleRecording = function() {
    const btnText = document.getElementById('recBtnText');
    const recDot  = document.getElementById('recDot');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        if (btnText) btnText.innerText = 'Export MP4';
        if (recDot) recDot.classList.remove('animate-ping');
        if (isPlayingSim) window.togglePlaySim();
        return;
    }

    window.initAudioMixer();

    const targetFps     = parseInt(document.getElementById('exportFpsSelect')?.value || 60, 10);
    const targetBitrate = parseInt(document.getElementById('exportBitrateSelect')?.value || 25000000, 10);

    if (playbackSpeed > 1 && videoGainNode && audioCtx) {
        videoGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    } else {
        window.updateAudioVolumes();
    }

    currentVideoSec = trimStartTotalSec;
    if (useVideoBg) hiddenVideo.currentTime = trimStartTotalSec;
    if (hasBgmLoaded && bgmAudio) {
        bgmAudio.currentTime = parseFloat(document.getElementById('bgmOffsetSec')?.value || 0);
    }

    const stream = canvas.captureStream(targetFps);
    if (audioDest) {
        const mixedTracks = audioDest.stream.getAudioTracks();
        if (mixedTracks.length > 0) stream.addTrack(mixedTracks[0]);
    }

    const mime = detectBestCodec();
    try {
        const opts = { videoBitsPerSecond: targetBitrate, audioBitsPerSecond: 192000 };
        if (mime) opts.mimeType = mime;
        mediaRecorder = new MediaRecorder(stream, opts);
    } catch (err) {
        mediaRecorder = new MediaRecorder(stream, { videoBitsPerSecond: targetBitrate });
    }

    recordedChunks = [];
    mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
        window.updateAudioVolumes();
        const actualMime = mediaRecorder.mimeType || mime || 'video/mp4';
        const ext = actualMime.includes('webm') ? 'webm' : 'mp4';
        const blob = new Blob(recordedChunks, { type: actualMime });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `render_${canvas.width}x${canvas.height}_${targetFps}fps_${playbackSpeed}x.${ext}`;
        a.click();
    };

    mediaRecorder.start(1000);
    if (!isPlayingSim) window.togglePlaySim();
    if (btnText) btnText.innerText = `Stop (${targetFps}fps)`;
    if (recDot) recDot.classList.add('animate-ping');
};