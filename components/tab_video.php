<div id="tab_video" class="modal-pane divide-y divide-[#232329]">
    
    <!-- SEKSI 1: SOURCE MEDIA -->
    <div class="p-4 space-y-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Source Input</div>

        <div class="grid grid-cols-2 gap-2">
            <label class="flex flex-col items-center justify-center gap-1.5 bg-[#18181c] hover:bg-[#202026] border border-dashed border-[#32323a] hover:border-zinc-500 rounded-md p-3 cursor-pointer transition text-center">
                <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span class="text-[11px] font-medium text-zinc-300">Load Video</span>
                <span class="text-[9px] text-zinc-500 font-mono-tech">MP4 / MOV</span>
                <input type="file" id="bgVideoInput" accept="video/*" class="hidden">
            </label>

            <label class="flex flex-col items-center justify-center gap-1.5 bg-[#18181c] hover:bg-[#202026] border border-dashed border-[#32323a] hover:border-zinc-500 rounded-md p-3 cursor-pointer transition text-center">
                <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span class="text-[11px] font-medium text-zinc-300">Still Image</span>
                <span class="text-[9px] text-zinc-500 font-mono-tech">PNG / JPG</span>
                <input type="file" id="bgImageInput" accept="image/*" class="hidden">
            </label>
        </div>

        <label class="flex items-center justify-between pt-1 cursor-pointer">
            <span class="text-xs text-zinc-400">Chroma Key Background (#00FF00)</span>
            <input type="checkbox" id="greenScreenMode" onchange="renderFrame()" class="w-3.5 h-3.5 accent-orange-500 rounded bg-zinc-900 border-zinc-700">
        </label>
    </div>

    <!-- SEKSI 2: TIMECODE, TRIM & SPEED BUTTONS -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Trim Bounds</span>
            <span id="lblTrimRange" class="text-[11px] font-mono-tech text-zinc-500">00:00 — 20:00</span>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">In Point (MM:SS)</label>
                <div class="flex items-center gap-1">
                    <input type="number" id="trimStartMin" value="0" min="0" onchange="updateTiming()" class="input-tech w-full rounded px-2 py-1 text-xs font-mono-tech text-center">
                    <span class="text-zinc-600 font-mono-tech">:</span>
                    <input type="number" id="trimStartSec" value="0" min="0" max="59" onchange="updateTiming()" class="input-tech w-full rounded px-2 py-1 text-xs font-mono-tech text-center">
                </div>
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Out Point (MM:SS)</label>
                <div class="flex items-center gap-1">
                    <input type="number" id="trimEndMin" value="20" min="0" onchange="updateTiming()" class="input-tech w-full rounded px-2 py-1 text-xs font-mono-tech text-center">
                    <span class="text-zinc-600 font-mono-tech">:</span>
                    <input type="number" id="trimEndSec" value="0" min="0" max="59" onchange="updateTiming()" class="input-tech w-full rounded px-2 py-1 text-xs font-mono-tech text-center">
                </div>
            </div>
        </div>

        <div class="pt-1 space-y-1.5">
            <div class="flex items-center justify-between">
                <label class="text-[11px] text-zinc-400">Global Playback Speed</label>
                <span id="lblSpeedInfo" class="text-[11px] font-mono-tech text-orange-400 font-semibold">1x</span>
            </div>
            <input type="hidden" id="exportSpeedSelect" value="1">
            <div class="grid grid-cols-6 gap-1 bg-[#09090b] p-1 rounded-md border border-[#232329]">
                <button type="button" onclick="setPlaybackSpeed(1)" data-speed="1" class="speed-btn bg-orange-500 text-zinc-950 font-mono-tech text-[11px] font-semibold py-1.5 rounded transition">1x</button>
                <button type="button" onclick="setPlaybackSpeed(2)" data-speed="2" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[11px] font-medium py-1.5 rounded transition">2x</button>
                <button type="button" onclick="setPlaybackSpeed(5)" data-speed="5" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[11px] font-medium py-1.5 rounded transition">5x</button>
                <button type="button" onclick="setPlaybackSpeed(10)" data-speed="10" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[11px] font-medium py-1.5 rounded transition">10x</button>
                <button type="button" onclick="setPlaybackSpeed(20)" data-speed="20" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[11px] font-medium py-1.5 rounded transition">20x</button>
                <button type="button" onclick="setPlaybackSpeed(50)" data-speed="50" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[11px] font-medium py-1.5 rounded transition">50x</button>
            </div>
        </div>
    </div>

    <!-- SEKSI 3: TIMELINE REGIONS (CUTS & LOCAL FX OVERRIDES) -->
    <div class="p-4 space-y-2.5">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Timeline Regions</span>
            <span id="lblCutCountBadge" class="text-[10px] font-mono-tech text-zinc-400">0 regions</span>
        </div>

        <div class="flex items-center justify-between text-[11px] bg-[#18181c] px-2.5 py-1.5 rounded border border-[#27272a]">
            <span id="lblEffectiveDuration" class="font-mono-tech text-zinc-300">Net Duration: 20:00</span>
            <button type="button" onclick="clearAllCutSegments()" class="text-[10px] text-zinc-500 hover:text-red-400 transition">
                Clear All
            </button>
        </div>

        <label class="flex items-center justify-between pt-0.5 cursor-pointer">
            <span class="text-[11px] text-zinc-400">Freeze Workout Timer on Cuts</span>
            <input type="checkbox" id="deductCutFromTimer" checked onchange="renderFrame()" class="w-3.5 h-3.5 accent-orange-500 rounded bg-zinc-900 border-zinc-700">
        </label>

        <!-- Daftar Region Cut & FX -->
        <div id="cutSegmentsList" class="max-h-40 overflow-y-auto space-y-1 pr-1"></div>
    </div>

    <!-- SEKSI 4: SPATIAL TRANSFORM (PAN & ZOOM) -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Transform</span>
            <button type="button" onclick="resetCameraFraming()" class="text-[11px] text-zinc-500 hover:text-zinc-200 transition">
                Reset
            </button>
        </div>

        <div class="space-y-2.5">
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Scale</span>
                    <span id="lblCamZoom" class="font-mono-tech text-zinc-300">100%</span>
                </div>
                <input type="range" id="camZoom" min="0.5" max="2.2" step="0.02" value="1.0" oninput="document.getElementById('lblCamZoom').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Position X</span>
                    <span id="lblCamPanX" class="font-mono-tech text-zinc-300">0 px</span>
                </div>
                <input type="range" id="camPanX" min="-500" max="500" step="5" value="0" oninput="renderFrame()" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Position Y</span>
                    <span id="lblCamPanY" class="font-mono-tech text-zinc-300">0 px</span>
                </div>
                <input type="range" id="camPanY" min="-500" max="500" step="5" value="0" oninput="renderFrame()" class="w-full">
            </div>
        </div>
    </div>

</div>