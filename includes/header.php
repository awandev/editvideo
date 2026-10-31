<header class="h-12 bg-[#0c0c0e] border-b border-[#232329] px-4 flex items-center justify-between shrink-0 z-30">
    <!-- Kiri: Identitas Aplikasi & Status File -->
    <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-sm bg-orange-500"></div>
            <span class="text-xs font-semibold tracking-wider uppercase text-zinc-100">Telemetry Studio</span>
        </div>
        <div class="h-3.5 w-[1px] bg-zinc-800"></div>
        <span id="lblVideoStatus" class="text-[11px] font-mono-tech text-zinc-500 truncate max-w-[220px]">No media loaded</span>
    </div>

    <!-- Kanan: Pengaturan Kualitas Export (Resolusi, FPS, Bitrate) & Tombol Render -->
    <div class="flex items-center gap-1.5">
        <!-- Rasio Aspek -->
        <div class="flex items-center bg-[#141418] border border-[#232329] rounded-md p-0.5">
            <select id="aspectRatioSelect" onchange="changeAspectRatio(this.value)" class="bg-transparent text-zinc-300 text-[11px] font-mono-tech font-medium px-2 py-1 focus:outline-none cursor-pointer" title="Aspect Ratio">
                <option value="9:16" class="bg-zinc-900">9:16 Vertical</option>
                <option value="16:9" class="bg-zinc-900">16:9 Landscape</option>
                <option value="1:1" class="bg-zinc-900">1:1 Square</option>
            </select>
        </div>

        <!-- Resolusi Kanvas -->
        <div class="flex items-center bg-[#141418] border border-[#232329] rounded-md p-0.5">
            <select id="exportResSelect" onchange="changeAspectRatio(document.getElementById('aspectRatioSelect').value)" class="bg-transparent text-zinc-300 text-[11px] font-mono-tech font-medium px-2 py-1 focus:outline-none cursor-pointer" title="Render Resolution">
                <option value="1080" selected class="bg-zinc-900">1080p Full HD</option>
                <option value="1440" class="bg-zinc-900">1440p 2K QHD</option>
                <option value="720" class="bg-zinc-900">720p HD</option>
            </select>
        </div>

        <!-- Framerate (Default 60 FPS) -->
        <div class="flex items-center bg-[#141418] border border-[#232329] rounded-md p-0.5">
            <select id="exportFpsSelect" class="bg-transparent text-orange-400 text-[11px] font-mono-tech font-semibold px-2 py-1 focus:outline-none cursor-pointer" title="Export Frame Rate">
                <option value="60" selected class="bg-zinc-900">60 FPS</option>
                <option value="30" class="bg-zinc-900">30 FPS</option>
            </select>
        </div>

        <!-- Bitrate Kualitas Video (Default 25 Mbps) -->
        <div class="flex items-center bg-[#141418] border border-[#232329] rounded-md p-0.5 hidden md:flex">
            <select id="exportBitrateSelect" class="bg-transparent text-emerald-400 text-[11px] font-mono-tech font-semibold px-2 py-1 focus:outline-none cursor-pointer" title="Video Bitrate">
                <option value="40000000" class="bg-zinc-900">40 Mbps (Ultra)</option>
                <option value="25000000" selected class="bg-zinc-900">25 Mbps (Pro 60fps)</option>
                <option value="15000000" class="bg-zinc-900">15 Mbps (High)</option>
                <option value="8000000" class="bg-zinc-900">8 Mbps (Standard)</option>
            </select>
        </div>

        <button onclick="downloadSnapshot()" class="flex items-center gap-1.5 bg-[#18181c] hover:bg-[#222228] text-zinc-300 border border-[#27272a] text-xs font-medium px-2.5 py-1.5 rounded-md transition" title="Save PNG Snapshot">
            <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <circle cx="12" cy="13" r="3"/>
            </svg>
            <span class="hidden sm:inline">PNG</span>
        </button>

        <button id="btnRecord" onclick="toggleRecording()" class="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-3.5 py-1.5 rounded-md transition">
            <span id="recDot" class="w-2 h-2 rounded-full bg-red-600"></span>
            <span id="recBtnText">Export MP4</span>
        </button>
    </div>
</header>