# scripts/apply_patches.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
$tmpDir = Join-Path $root "tmp\codex_run"
if (-not (Test-Path $tmpDir)) { New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null }
$logFile = Join-Path $tmpDir "patch_apply_log.txt"
"Run started at $(Get-Date)" | Out-File $logFile -Encoding utf8
Start-Transcript -Path (Join-Path $tmpDir "run_transcript.txt") -Force
Try {
    Get-ChildItem -Path ".\patches" -Filter "*.patch" -ErrorAction Stop | ForEach-Object {
        $patch = $_.FullName
        "`nProcessing patch $patch" | Out-File $logFile -Append -Encoding utf8
        $content = Get-Content $patch -Raw -Encoding utf8
        $lines = $content -split "`n"
        $currentOut = $null
        $buffer = @()
        foreach ($line in $lines) {
            if ($line -match '^\*\*\* Add File: (.+)') {
                if ($currentOut) {
                    $outPath = $currentOut.Trim()
                    if (Test-Path $outPath) {
                        $bak = Join-Path $tmpDir ("backup_" + (Split-Path $outPath -Leaf) + "_" + (Get-Date -Format yyyyMMddHHmmss) + ".bak")
                        Copy-Item -Path $outPath -Destination $bak -Force
                        "SKIP existing: $outPath -> backed up to $bak" | Out-File $logFile -Append -Encoding utf8
                        $proposal = Join-Path $tmpDir ("merge_proposal_" + (Split-Path $outPath -Leaf) + ".md")
                        "## Merge proposal for $outPath`nSource: $patch`n" | Out-File $proposal -Encoding utf8
                        ($buffer | Select-Object -First 200) | Out-File $proposal -Append -Encoding utf8
                        "Created merge proposal: $proposal" | Out-File $logFile -Append -Encoding utf8
                    } else {
                        $clean = $buffer | ForEach-Object { if ($_.Length -gt 0 -and $_[0] -eq '+') { $_.Substring(1) } else { $_ } }
                        $outDir = Split-Path -Parent $outPath
                        if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
                        $clean | Set-Content -Path $outPath -Encoding utf8
                        "WROTE: $outPath (lines: $($clean.Count))" | Out-File $logFile -Append -Encoding utf8
                    }
                    $buffer = @()
                }
                $currentOut = $Matches[1]
                continue
            }
            if ($currentOut) { $buffer += $line.TrimEnd("`r") }
        }
        if ($currentOut) {
            $outPath = $currentOut.Trim()
            if (Test-Path $outPath) {
                $bak = Join-Path $tmpDir ("backup_" + (Split-Path $outPath -Leaf) + "_" + (Get-Date -Format yyyyMMddHHmmss) + ".bak")
                Copy-Item -Path $outPath -Destination $bak -Force
                "SKIP existing: $outPath -> backed up to $bak" | Out-File $logFile -Append -Encoding utf8
                $proposal = Join-Path $tmpDir ("merge_proposal_" + (Split-Path $outPath -Leaf) + ".md")
                "## Merge proposal for $outPath`nSource: $patch`n" | Out-File $proposal -Encoding utf8
                ($buffer | Select-Object -First 200) | Out-File $proposal -Append -Encoding utf8
                "Created merge proposal: $proposal" | Out-File $logFile -Append -Encoding utf8
            } else {
                $clean = $buffer | ForEach-Object { if ($_.Length -gt 0 -and $_[0] -eq '+') { $_.Substring(1) } else { $_ } }
                $outDir = Split-Path -Parent $outPath
                if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
                $clean | Set-Content -Path $outPath -Encoding utf8
                "WROTE: $outPath (lines: $($clean.Count))" | Out-File $logFile -Append -Encoding utf8
            }
        }
    }
    "All patches processed." | Out-File $logFile -Append -Encoding utf8
} Catch {
    "ERROR: $($_.Exception.Message)" | Out-File $logFile -Append -Encoding utf8
    throw
} Finally {
    Stop-Transcript
    "Finished at $(Get-Date)" | Out-File $logFile -Append -Encoding utf8
}
Get-Content $logFile -Tail 200
