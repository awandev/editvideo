<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'parse_file' && isset($_FILES['hr_file'])) {
    header('Content-Type: application/json');
    $tmpName = $_FILES['hr_file']['tmp_name'];
    $fileName = strtolower($_FILES['hr_file']['name']);
    $bpmList = [];

    if (is_uploaded_file($tmpName)) {
        $content = file_get_contents($tmpName);
        if (str_ends_with($fileName, '.tcx') || str_contains($content, '<TrainingCenterDatabase')) {
            preg_match_all('/<HeartRateBpm>.*?<Value>\s*(\d+)\s*<\/Value>.*?<\/HeartRateBpm>/is', $content, $matches);
            if (!empty($matches[1])) $bpmList = array_map('intval', $matches[1]);
        } else {
            $lines = preg_split('/\r\n|\r|\n/', trim($content));
            foreach ($lines as $line) {
                foreach (str_getcsv($line) as $col) {
                    $val = intval(trim($col));
                    if ($val >= 40 && $val <= 230) { $bpmList[] = $val; break; }
                }
            }
        }
    }
    echo json_encode(['status' => count($bpmList) ? 'success' : 'empty', 'data' => $bpmList]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="id" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Studio — Video Telemetry Editor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <!-- Font UI + 12 Font Overlay HUD -->
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@700;900&family=Bebas+Neue&family=Black+Ops+One&family=Chakra+Petch:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&family=Montserrat:wght@700;900&family=Orbitron:wght@700;900&family=Oswald:wght@600;700&family=Rajdhani:wght@700&family=Russo+One&family=Teko:wght@600;700&display=swap" rel="stylesheet">

    <!-- Tambahkan di dalam <head> pada index.php -->
    <link href="https://fonts.cdnfonts.com/css/vcr-osd-mono" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-base: #09090b;
            --bg-panel: #121215;
            --bg-elevated: #18181c;
            --border-subtle: #232329;
            --border-focus: #3f3f46;
            --accent: #f97316;
        }
        body {
            background-color: var(--bg-base);
            color: #e4e4e7;
            font-family: 'Inter', -apple-system, sans-serif;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
        }
        .font-mono-tech {
            font-family: 'JetBrains Mono', monospace;
            font-variant-numeric: tabular-nums;
        }
        .viewport-grid {
            background-color: #070709;
            background-image: radial-gradient(#1f1f26 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .rail-btn {
            position: relative;
            color: #71717a;
            transition: color 0.15s ease, background-color 0.15s ease;
        }
        .rail-btn:hover { color: #d4d4d8; background-color: #18181c; }
        .rail-btn.active { color: #fafafa; background-color: #18181c; }
        .rail-btn.active::before {
            content: '';
            position: absolute;
            left: 0; top: 20%; height: 60%; width: 2px;
            background-color: var(--accent);
            border-radius: 0 2px 2px 0;
        }
        input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
        input[type="range"]::-webkit-slider-runnable-track { background: #27272a; height: 4px; border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none; margin-top: -5px;
            background-color: #e4e4e7; height: 14px; width: 14px; border-radius: 50%;
            border: 2px solid #09090b; box-shadow: 0 1px 3px rgba(0,0,0,0.6);
        }
        .input-tech { background-color: #09090b; border: 1px solid var(--border-subtle); color: #f4f4f5; }
        .input-tech:focus { outline: none; border-color: #52525b; }
        canvas {
            max-width: 100%; max-height: 72vh; width: auto; height: auto;
            border-radius: 4px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
            border: 1px solid #27272a;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
    </style>
</head>
<body class="h-screen flex flex-col select-none">

    <?php include 'includes/header.php'; ?>

    <div class="flex-1 flex overflow-hidden relative">
        <?php include 'includes/sidebar.php'; ?>
        <?php include 'includes/main_view.php'; ?>
    </div>

    <video id="hiddenVideo" class="hidden" playsinline crossorigin="anonymous"></video>
    
    <!-- Script Core & Modul -->
    <script src="assets/app.js"></script>
    <script src="assets/hr_module.js"></script>
    <script src="assets/timer_module.js"></script>
    <script src="assets/workout_module.js"></script>
    <script src="assets/audio_lut_module.js"></script>
    <script src="assets/title_module.js"></script>
    <script src="assets/cut_module.js"></script>
    <script src="assets/template_module.js"></script>

</body>
</html>