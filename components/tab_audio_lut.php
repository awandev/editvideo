<div id="tab_audio_lut" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- Elemen Audio Backsound -->
    <audio id="bgmAudio" class="hidden" loop crossorigin="anonymous"></audio>

    <!-- SEKSI 1: COLOR GRADING & 3D LUT (20 GROUPED PRESETS) -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Color Grading (LUT)</span>
            <span id="lblLutStatus" class="text-[10px] font-mono-tech text-zinc-500">Rec.709 Standard</span>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Workout LUT Profile (20 Grouped Styles)</label>
            <select id="lutPresetSelect" onchange="onLutPresetChange()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="none" class="bg-zinc-900 text-zinc-300">00 — Bypass (Original Rec.709)</option>

                <optgroup label="Group 1 — Hardcore & Muscle Grit (5 Styles)" class="bg-zinc-900 text-orange-400">
                    <option value="bleach_grit" class="text-zinc-100">01 — Bleach Bypass (Hardcore Grit)</option>
                    <option value="iron_shadow" class="text-zinc-100">02 — Dark Iron (Muscle Definition)</option>
                    <option value="spartan_bronze" class="text-zinc-100">03 — Spartan Bronze (Warm Grit)</option>
                    <option value="concrete_raw" class="text-zinc-100">04 — Concrete Raw (Industrial Box)</option>
                    <option value="adrenaline_punch" class="text-zinc-100">05 — Adrenaline HDR (Micro-Contrast)</option>
                </optgroup>

                <optgroup label="Group 2 — Cinematic & Commercial Gym (5 Styles)" class="bg-zinc-900 text-sky-400">
                    <option value="teal_orange" class="text-zinc-100">06 — Teal & Orange (Cinema Gym)</option>
                    <option value="nike_commercial" class="text-zinc-100">07 — Pro Commercial (Clean & Crisp)</option>
                    <option value="moody_dark" class="text-zinc-100">08 — Moody Dark (Aesthetic Focus)</option>
                    <option value="cyber_neon" class="text-zinc-100">09 — Neon Night Gym (Cyan/Magenta)</option>
                    <option value="anamorphic_blue" class="text-zinc-100">10 — Cobalt Anamorphic (Cool Cinema)</option>
                </optgroup>

                <optgroup label="Group 3 — Outdoor & Street Calisthenics (5 Styles)" class="bg-zinc-900 text-emerald-400">
                    <option value="golden_hour" class="text-zinc-100">11 — Golden Hour (Warm Sunset)</option>
                    <option value="tropical_calisthenics" class="text-zinc-100">12 — Tropical Sun (Vibrant Daylight)</option>
                    <option value="urban_street" class="text-zinc-100">13 — Urban Asphalt (Cool Concrete)</option>
                    <option value="high_noon" class="text-zinc-100">14 — Harsh Sun Recovery (Soft Highlight)</option>
                    <option value="morning_mist" class="text-zinc-100">15 — Crisp Morning (Fresh Cool Air)</option>
                </optgroup>

                <optgroup label="Group 4 — Monochrome & Retro Camcorder (5 Styles)" class="bg-zinc-900 text-purple-400">
                    <option value="bw_noir" class="text-zinc-100">16 — Silver Noir (High-Contrast B&W)</option>
                    <option value="bw_matte" class="text-zinc-100">17 — Carbon Matte (Faded Film B&W)</option>
                    <option value="bw_red_filter" class="text-zinc-100">18 — Titanium B&W (Bright Skin Tone)</option>
                    <option value="vhs_camcorder" class="text-zinc-100">19 — 90s Camcorder Tape (Retro VHS)</option>
                    <option value="kodachrome" class="text-zinc-100">20 — Kodachrome 64 (Vintage Analog)</option>
                </optgroup>

                <optgroup label="External File" class="bg-zinc-900 text-zinc-400">
                    <option value="custom_cube" class="text-zinc-100">21 — Custom 3D LUT (.CUBE File)</option>
                </optgroup>
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
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">CH 1 — Source Video Audio</span>
                    <span id="lblVidVol" class="font-mono-tech text-zinc-300">80%</span>
                </div>
                <input type="range" id="videoVolSlider" min="0" max="1.5" step="0.05" value="0.80" oninput="updateAudioVolumes()" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">CH 2 — BGM Track Gain</span>
                    <span id="lblBgmVol" class="font-mono-tech text-zinc-300">60%</span>
                </div>
                <input type="range" id="bgmVolSlider" min="0" max="1.5" step="0.05" value="0.60" oninput="updateAudioVolumes()" class="w-full">
            </div>

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