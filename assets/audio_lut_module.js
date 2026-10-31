/**
 * AUDIO MIXER & LUT COLOR GRADING MODULE (FULL VERSION + 60FPS EXPORT FIX)
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
// 2. COLOR GRADING & 3D .CUBE LUT PARSER
// ============================================================================
window.onLutPresetChange = function() {
    const val = document.getElementById('lutPresetSelect')?.value || 'none';
    const lbl = document.getElementById('lblLutStatus');
    if (lbl) {
        lbl.innerText = (val === 'none') ? 'Rec.709 Standard' : val.replace('_', ' ').toUpperCase();
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

    ctx.save();

    if (preset === 'teal_orange') {
        ctx.filter = `contrast(${100 + 22 * intensity}%) saturate(${100 + 30 * intensity}%) brightness(${100 - 4 * intensity}%)`;
    } else if (preset === 'moody_dark') {
        ctx.filter = `contrast(${100 + 32 * intensity}%) saturate(${100 - 28 * intensity}%) brightness(${100 - 14 * intensity}%)`;
    } else if (preset === 'bleach_grit') {
        ctx.filter = `contrast(${100 + 45 * intensity}%) saturate(${100 - 55 * intensity}%) brightness(${100 - 8 * intensity}%)`;
    } else if (preset === 'cold_steel') {
        ctx.filter = `contrast(${100 + 18 * intensity}%) saturate(${100 - 20 * intensity}%) hue-rotate(${-12 * intensity}deg)`;
    } else if (preset === 'golden_hour') {
        ctx.filter = `contrast(${100 + 12 * intensity}%) saturate(${100 + 35 * intensity}%) sepia(${28 * intensity}%)`;
    } else if (preset === 'kodachrome') {
        ctx.filter = `contrast(${100 + 20 * intensity}%) sepia(${35 * intensity}%) saturate(${100 + 15 * intensity}%)`;
    } else if (preset === 'bw_noir') {
        ctx.filter = `grayscale(${100 * intensity}%) contrast(${100 + 42 * intensity}%) brightness(${100 - 6 * intensity}%)`;
    } else if (preset === 'vibrant_pop') {
        ctx.filter = `contrast(${100 + 18 * intensity}%) saturate(${100 + 45 * intensity}%) brightness(${100 + 4 * intensity}%)`;
    }

    const baseScale = Math.max(cW / mW, cH / mH) * camZoom;
    const dW = mW * baseScale;
    const dH = mH * baseScale;
    const dx = ((cW - dW) / 2) + camPanX;
    const dy = ((cH - dH) / 2) + camPanY;

    ctx.drawImage(media, dx, dy, dW, dH);
    ctx.filter = 'none';

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

    if (preset !== 'none' && preset !== 'custom_cube' && intensity > 0) {
        ctx.save();
        if (preset === 'teal_orange') {
            ctx.globalCompositeOperation = 'overlay';
            const grad = ctx.createLinearGradient(0, 0, cW, cH);
            grad.addColorStop(0, `rgba(255, 135, 50, ${0.22 * intensity})`);
            grad.addColorStop(1, `rgba(0, 140, 175, ${0.28 * intensity})`);
            ctx.fillStyle = grad; ctx.fillRect(0, 0, cW, cH);
        } else if (preset === 'moody_dark' || preset === 'bleach_grit') {
            const rad = ctx.createRadialGradient(cW/2, cH/2, cW*0.25, cW/2, cH/2, cH*0.75);
            rad.addColorStop(0, 'rgba(0,0,0,0)'); rad.addColorStop(1, `rgba(0,0,0,${0.55 * intensity})`);
            ctx.fillStyle = rad; ctx.fillRect(0, 0, cW, cH);
        } else if (preset === 'cold_steel') {
            ctx.globalCompositeOperation = 'soft-light';
            ctx.fillStyle = `rgba(30, 110, 220, ${0.32 * intensity})`; ctx.fillRect(0, 0, cW, cH);
        } else if (preset === 'golden_hour') {
            ctx.globalCompositeOperation = 'soft-light';
            ctx.fillStyle = `rgba(255, 160, 40, ${0.30 * intensity})`; ctx.fillRect(0, 0, cW, cH);
        }
        ctx.restore();
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

// Deteksi Codec Terbaik dengan Fallback Aman
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
        // Fallback otomatis jika browser menolak kombinasi codec/bitrate tertentu
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