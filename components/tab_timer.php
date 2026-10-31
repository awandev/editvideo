<div id="tab_timer" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- SEKSI 1: VISIBILITY & PRESET STYLE -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Layer Visibility</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="showTimerWidget" onchange="renderFrame()" class="sr-only peer">
                <div class="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
        </div>

        <div>
            <div class="flex items-center justify-between mb-1">
                <label class="text-[10px] text-zinc-500">Timer Style (24 Presets)</label>
                <button type="button" onclick="syncTimerWithHrStyle()" class="flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-300 transition" title="Match style, font & scale with BPM widget">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    <span>Sync with BPM</span>
                </button>
            </div>
            <select id="timerStyleSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <optgroup label="A. Minimal / Text-Only" class="bg-zinc-900 text-zinc-400">
                    <option value="text_pure" class="text-zinc-100">01 — Pure Timecode Only</option>
                    <option value="clean_digital" class="text-zinc-100">02 — Digital + Top Label</option>
                    <option value="text_slash_total" class="text-zinc-100">03 — Elapsed / Total + Progress</option>
                    <option value="text_outline" class="text-zinc-100">04 — Hollow Stroke Outline</option>
                    <option value="text_neon" class="text-zinc-100">05 — Luminous Glow Text</option>
                    <option value="text_stacked" class="text-zinc-100">06 — Vertical Stacked (MM / SS)</option>
                </optgroup>
                <optgroup label="B. Telemetry Matched (Pairs with BPM)" class="bg-zinc-900 text-zinc-400">
                    <option value="match_dji_ring" class="text-zinc-100">07 — DJI Osmo Circular Gauge</option>
                    <option value="match_dji_wave" class="text-zinc-100">08 — Telemetry Sine Wave</option>
                    <option value="match_apple_ring" class="text-zinc-100">09 — Activity Ring + Clock</option>
                    <option value="match_garmin_arc" class="text-zinc-100">10 — 5-Segment Radial Arc</option>
                    <option value="match_whoop_bar" class="text-zinc-100">11 — Strain Progress Bar</option>
                    <option value="match_strava_clean" class="text-zinc-100">12 — Clean Left Accent Line</option>
                    <option value="match_coros_hex" class="text-zinc-100">13 — Tactical Hexagon</option>
                    <option value="match_nike_volt" class="text-zinc-100">14 — Slanted Volt Badge</option>
                    <option value="match_polar_badge" class="text-zinc-100">15 — Header Card Monitor</option>
                    <option value="match_cyber_brackets" class="text-zinc-100">16 — Corner Reticle Brackets</option>
                    <option value="match_crossfit_tile" class="text-zinc-100">17 — Broadcast Square Tile</option>
                    <option value="match_stopwatch_analog" class="text-zinc-100">18 — Analog Radial Sweep</option>
                    <option value="match_vertical_meter" class="text-zinc-100">19 — Vertical Progress Barometer</option>
                    <option value="match_neon_box" class="text-zinc-100">20 — Luminous Outline Box</option>
                    <option value="match_glass_capsule" class="text-zinc-100">21 — Frosted Pill Capsule</option>
                </optgroup>
                <optgroup label="C. Broadcast & Scoreboard" class="bg-zinc-900 text-zinc-400">
                    <option value="dji_pill" class="text-zinc-100">22 — Dark Pill + Bottom Bar</option>
                    <option value="broadcast_tag" class="text-zinc-100">23 — Broadcast Corner Box</option>
                    <option value="match_split_flap" class="text-zinc-100">24 — Split-Digit Scoreboard</option>
                </optgroup>
            </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Count Mode</label>
                <select id="timerCountMode" onchange="renderFrame()" class="input-tech w-full rounded px-2 py-1.5 text-xs">
                    <option value="count_up">Count Up (00:00)</option>
                    <option value="count_down">Countdown</option>
                    <option value="with_total">Elapsed / Total</option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Header Label</label>
                <input type="text" id="timerCustomLabel" value="WORKOUT TIME" oninput="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech uppercase" placeholder="DURATION">
            </div>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Typography</label>
            <select id="timerFontSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
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
            <button type="button" onclick="resetTimerPosition()" class="text-[11px] text-zinc-500 hover:text-zinc-200 transition">
                Reset Position
            </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <label class="flex items-center justify-between bg-[#18181c] border border-[#27272a] rounded px-2.5 py-1.5 cursor-pointer">
                <span class="text-[11px] text-zinc-300">Digits</span>
                <input type="color" id="timerTextColorPicker" value="#ffffff" oninput="renderFrame()" class="w-5 h-5 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex items-center justify-between bg-[#18181c] border border-[#27272a] rounded px-2.5 py-1.5 cursor-pointer">
                <span class="text-[11px] text-zinc-300">Accent</span>
                <input type="color" id="timerAccentColorPicker" value="#f97316" oninput="renderFrame()" class="w-5 h-5 rounded border-0 bg-transparent cursor-pointer">
            </label>
        </div>

        <div class="space-y-2.5 pt-1">
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Scale</span>
                    <span id="lblTimerScale" class="font-mono-tech text-zinc-300">100%</span>
                </div>
                <input type="range" id="timerScaleSlider" min="0.5" max="1.8" step="0.05" value="1.0" oninput="document.getElementById('lblTimerScale').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Backdrop Opacity</span>
                    <span id="lblTimerOpacity" class="font-mono-tech text-zinc-300">65%</span>
                </div>
                <input type="range" id="timerOpacitySlider" min="0" max="0.95" step="0.05" value="0.65" oninput="document.getElementById('lblTimerOpacity').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>
        </div>
    </div>

</div>