$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$source = Join-Path $repo 'tools\NewsAppLauncher.cs'
$distRoot = Join-Path $repo 'dist'
$dist = Join-Path $distRoot 'NewsApp'
$output = Join-Path $dist 'NewsApp.exe'
$node = Join-Path ${env:ProgramFiles} 'nodejs\node.exe'

if (-not (Test-Path -LiteralPath $compiler)) {
  throw "C# compiler not found at $compiler"
}

if (-not (Test-Path -LiteralPath $node)) {
  throw "node.exe not found at $node"
}

New-Item -ItemType Directory -Force -Path $dist | Out-Null

& $compiler /nologo /target:winexe /out:$output /reference:System.Windows.Forms.dll $source

Copy-Item -LiteralPath $node -Destination (Join-Path $dist 'node.exe') -Force
Copy-Item -LiteralPath (Join-Path $repo 'server.js') -Destination $dist -Force
Copy-Item -LiteralPath (Join-Path $repo 'package.json') -Destination $dist -Force
Copy-Item -LiteralPath (Join-Path $repo 'package-lock.json') -Destination $dist -Force
Copy-Item -LiteralPath (Join-Path $repo 'public') -Destination $dist -Recurse -Force
Copy-Item -LiteralPath (Join-Path $repo 'src') -Destination $dist -Recurse -Force
Copy-Item -LiteralPath (Join-Path $repo 'node_modules') -Destination $dist -Recurse -Force

Write-Host "Built portable app at $dist"
Write-Host "Run $output on any Windows machine by keeping it in this folder."
