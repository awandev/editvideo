<div id="tab_hr" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- SEKSI 1: VISIBILITY & PRESET STYLE -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Layer Visibility</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="showHrWidget" onchange="renderFrame()" class="sr-only peer">
                <div class="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Telemetry Style (17 Presets)</label>
            <select id="hudStyleSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <optgroup label="Minimal (Icon & Value Only)" class="bg-zinc-900 text-zinc-400">
                    <option value="heart_num_side" class="text-zinc-100">01 — Icon + Value (Horizontal)</option>
                    <option value="heart_num_inside" class="text-zinc-100">02 — Value Inside Heart</option>
                </optgroup>
                <optgroup label="Telemetry & Action Cam" class="bg-zinc-900 text-zinc-400">
                    <option value="dji_ring" class="text-zinc-100">03 — DJI Osmo Circular Gauge</option>
                    <option value="dji_ecg" class="text-zinc-100">04 — Live ECG Waveform</option>
                    <option value="apple_fitness" class="text-zinc-100">05 — Activity Ring Metric</option>
                    <option value="garmin_arc" class="text-zinc-100">06 — 5-Zone Radial Arc</option>
                    <option value="whoop_strain" class="text-zinc-100">07 — Strain Percentage Bar</option>
                    <option value="strava_minimal" class="text-zinc-100">08 — Clean Left Accent Line</option>
                    <option value="coros_hex" class="text-zinc-100">09 — Tactical Hexagon</option>
                    <option value="nike_volt" class="text-zinc-100">10 — Slanted Volt Badge</option>
                    <option value="polar_beat" class="text-zinc-100">11 — Header Card Monitor</option>
                    <option value="cyber_hud" class="text-zinc-100">12 — Corner Reticle Brackets</option>
                    <option value="crossfit_tile" class="text-zinc-100">13 — Broadcast Square Tile</option>
                    <option value="heart_fill" class="text-zinc-100">14 — Dual Layer Heart + BPM</option>
                    <option value="vertical_meter" class="text-zinc-100">15 — Vertical Zone Barometer</option>
                    <option value="neon_glow" class="text-zinc-100">16 — Luminous Outline Box</option>
                    <option value="glass_badge" class="text-zinc-100">17 — Frosted Pill Capsule</option>
                </optgroup>
            </select>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Typography</label>
            <select id="fontFamilySelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="'Chakra Petch', sans-serif">Chakra Petch — Technical</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono — Tabular</option>
                <option value="'Bebas Neue', sans-serif">Bebas Neue — Condensed Tall</option>
                <option value="'Teko', sans-serif">Teko — Square Athletic</option>
                <option value="'Barlow Condensed', sans-serif">Barlow Condensed — Broadcast</option>
                <option value="'Rajdhani', sans-serif">Rajdhani — Geometric</option>
                <option value="'Russo One', sans-serif">Russo One — Heavy Block</option>
                <option value="'Black Ops One', cursive">Black Ops One — Stencil</option>
                <option value="'Anton', sans-serif">Anton — Impact</option>
                <option value="'Montserrat', sans-serif">Montserrat — Geometric Sans</option>
                <option value="'Orbitron', sans-serif">Orbitron — Sci-Fi Wide</option>
                <option value="'Oswald', sans-serif">Oswald — Classic Din</option>
            </select>
        </div>
    </div>

    <!-- SEKSI 2: APPEARANCE & GEOMETRY -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Appearance</span>
            <button type="button" onclick="resetHrPosition()" class="text-[11px] text-zinc-500 hover:text-zinc-200 transition">
                Reset Position
            </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <label class="flex items-center justify-between bg-[#18181c] border border-[#27272a] rounded px-2.5 py-1.5 cursor-pointer">
                <span class="text-[11px] text-zinc-300">Primary</span>
                <input type="color" id="heartColorPicker" value="#ef4444" oninput="renderFrame()" class="w-5 h-5 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex items-center justify-between bg-[#18181c] border border-[#27272a] rounded px-2.5 py-1.5 cursor-pointer">
                <span class="text-[11px] text-zinc-300">Accent</span>
                <input type="color" id="accentColorPicker" value="#f97316" oninput="renderFrame()" class="w-5 h-5 rounded border-0 bg-transparent cursor-pointer">
            </label>
        </div>

        <div class="space-y-2.5 pt-1">
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Scale</span>
                    <span id="lblHrScale" class="font-mono-tech text-zinc-300">100%</span>
                </div>
                <input type="range" id="hudScale" min="0.5" max="1.8" step="0.05" value="1.0" oninput="document.getElementById('lblHrScale').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Backdrop Opacity</span>
                    <span id="lblHrOpacity" class="font-mono-tech text-zinc-300">65%</span>
                </div>
                <input type="range" id="bgOpacitySlider" min="0" max="0.95" step="0.05" value="0.65" oninput="document.getElementById('lblHrOpacity').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>
        </div>
    </div>

    <!-- SEKSI 3: TELEMETRY DATA SOURCE -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Data Source (5s Interval)</span>
            <button type="button" onclick="generateSampleHr()" class="text-[11px] text-orange-400 hover:text-orange-300 transition">
                Generate Sample
            </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <!-- Ekstrak dari Screenshot Grafik Huawei -->
            <label class="flex flex-col items-center justify-center gap-1 bg-[#18181c] hover:bg-[#202026] border border-dashed border-[#32323a] hover:border-zinc-500 rounded-md p-2.5 cursor-pointer transition text-center">
                <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
                <span class="text-[11px] font-medium text-zinc-300">Graph Image</span>
                <span class="text-[9px] text-zinc-500 font-mono-tech">Huawei Screenshot</span>
                <input type="file" accept="image/*" onchange="extractFromGraphImage(this)" class="hidden">
            </label>

            <!-- Upload File TCX / CSV -->
            <label class="flex flex-col items-center justify-center gap-1 bg-[#18181c] hover:bg-[#202026] border border-dashed border-[#32323a] hover:border-zinc-500 rounded-md p-2.5 cursor-pointer transition text-center">
                <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="text-[11px] font-medium text-zinc-300">Telemetry File</span>
                <span class="text-[9px] text-zinc-500 font-mono-tech">TCX / CSV</span>
                <input type="file" accept=".tcx,.csv,.txt" onchange="uploadFileToPhp(this)" class="hidden">
            </label>
        </div>

        <div>
            <div class="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>BPM Sequence</span>
                <span id="lblHrCount" class="font-mono-tech">0 pts</span>
            </div>
            <textarea id="hrDataInput" rows="3" oninput="parseHrInput()" placeholder="120, 125, 132, 140..." class="input-tech w-full rounded p-2 text-[11px] font-mono-tech text-zinc-300 resize-none"></textarea>
        </div>
    </div>

</div>