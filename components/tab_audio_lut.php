<div id="tab_audio_lut" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- Elemen Audio Backsound -->
    <audio id="bgmAudio" class="hidden" loop crossorigin="anonymous"></audio>

    <!-- SEKSI 1: COLOR GRADING & 3D LUT -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Color Grading (LUT)</span>
            <span id="lblLutStatus" class="text-[10px] font-mono-tech text-zinc-500">Rec.709 Standard</span>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Color Profile / Preset</label>
            <select id="lutPresetSelect" onchange="onLutPresetChange()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="none">00 — Bypass (Original Source)</option>
                <option value="teal_orange">01 — Teal & Orange (Cinema Gym)</option>
                <option value="moody_dark">02 — Moody Dark Contrast</option>
                <option value="bleach_grit">03 — Bleach Bypass (Hardcore Grit)</option>
                <option value="cold_steel">04 — Cold Steel (Tactical Blue)</option>
                <option value="golden_hour">05 — Warm tungsten / Golden Hour</option>
                <option value="kodachrome">06 — Vintage Film Stock</option>
                <option value="bw_noir">07 — Monochrome High-Contrast</option>
                <option value="vibrant_pop">08 — Commercial Saturation Pop</option>
                <option value="custom_cube">09 — Custom 3D LUT (.CUBE)</option>
            </select>
        </div>

        <!-- Dropzone File .CUBE -->
        <div>
            <label class="flex items-center justify-between bg-[#18181c] hover:bg-[#202026] border border-dashed border-[#32323a] hover:border-zinc-500 rounded-md px-3 py-2 cursor-pointer transition">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    <div class="text-left">
                        <div id="lblCubeFileName" class="text-[11px] font-medium text-zinc-300">Load 3D LUT File</div>
                        <div class="text-[9px] text-zinc-500 font-mono-tech">.CUBE (DaVinci / Premiere)</div>
                    </div>
                </div>
                <span class="text-[10px] font-mono-tech text-zinc-400 bg-[#09090b] px-2 py-0.5 rounded border border-[#27272a]">Browse</span>
                <input type="file" id="cubeFileInput" accept=".cube" onchange="loadCubeLutFile(this)" class="hidden">
            </label>
        </div>

        <div class="pt-1">
            <div class="flex justify-between text-[11px] mb-1">
                <span class="text-zinc-400">Grade Intensity</span>
                <span id="lblLutIntensity" class="font-mono-tech text-zinc-300">85%</span>
            </div>
            <input type="range" id="lutIntensitySlider" min="0" max="1" step="0.05" value="0.85" oninput="document.getElementById('lblLutIntensity').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
        </div>
    </div>

    <!-- SEKSI 2: BACKSOUND / BGM TRACK -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">BGM Audio Track</span>
            <span id="lblBgmStatus" class="text-[10px] font-mono-tech text-zinc-500">No track</span>
        </div>

        <label class="flex items-center justify-between bg-[#18181c] hover:bg-[#202026] border border-dashed border-[#32323a] hover:border-zinc-500 rounded-md px-3 py-2.5 cursor-pointer transition">
            <div class="flex items-center gap-2.5 min-w-0">
                <svg class="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>
                <div class="truncate">
                    <div id="lblBgmFileName" class="text-[11px] font-medium text-zinc-300 truncate">Load Audio File</div>
                    <div class="text-[9px] text-zinc-500 font-mono-tech">MP3 / WAV / AAC (1.0x Constant)</div>
                </div>
            </div>
            <span class="text-[10px] font-mono-tech text-zinc-400 bg-[#09090b] px-2 py-0.5 rounded border border-[#27272a] shrink-0">Import</span>
            <input type="file" id="bgmFileInput" accept="audio/*" class="hidden">
        </label>

        <div class="flex items-center justify-between pt-1">
            <label class="text-[11px] text-zinc-400">Track Start Offset (Sec)</label>
            <input type="number" id="bgmOffsetSec" value="0" min="0" step="0.5" class="input-tech w-20 rounded px-2 py-1 text-xs font-mono-tech text-center">
        </div>
    </div>

    <!-- SEKSI 3: MULTI-CHANNEL AUDIO MIXER -->
    <div class="p-4 space-y-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Channel Mixer</div>

        <div class="space-y-3">
            <!-- Ch 1: Original Video Audio -->
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">CH 1 — Source Video Audio</span>
                    <span id="lblVidVol" class="font-mono-tech text-zinc-300">80%</span>
                </div>
                <input type="range" id="videoVolSlider" min="0" max="1.5" step="0.05" value="0.80" oninput="updateAudioVolumes()" class="w-full">
            </div>

            <!-- Ch 2: Backsound Music -->
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">CH 2 — BGM Track Gain</span>
                    <span id="lblBgmVol" class="font-mono-tech text-zinc-300">60%</span>
                </div>
                <input type="range" id="bgmVolSlider" min="0" max="1.5" step="0.05" value="0.60" oninput="updateAudioVolumes()" class="w-full">
            </div>

            <!-- Ch 3: Telemetry SFX -->
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">CH 3 — Telemetry Cue SFX</span>
                    <span id="lblSfxVol" class="font-mono-tech text-zinc-300">50%</span>
                </div>
                <input type="range" id="sfxVolSlider" min="0" max="1.5" step="0.05" value="0.50" oninput="updateAudioVolumes()" class="w-full">
            </div>
        </div>
    </div>

    <!-- SEKSI 4: ACOUSTIC TRIGGERS (SFX) -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <div>
                <div class="text-xs font-medium text-zinc-300">Acoustic Rep & Round Cues</div>
                <div class="text-[10px] text-zinc-500">Synthesize tone on counter increment</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="enableRepBeep" checked class="sr-only peer">
                <div class="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onclick="playSfxBeep(880, 0.11)" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[11px] font-medium py-1.5 px-2.5 rounded transition flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 010 7.07"/>
                </svg>
                <span>Test Rep Cue</span>
            </button>
            <button type="button" onclick="playRoundBellSfx()" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[11px] font-medium py-1.5 px-2.5 rounded transition flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span>Test Round Bell</span>
            </button>
        </div>
    </div>

</div>