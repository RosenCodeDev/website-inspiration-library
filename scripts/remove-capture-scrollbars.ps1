param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$captureRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\assets\site-captures'
$crops = @(
  @{ Name = '13-linq.png'; SourceWidth = 1266; SourceHeight = 713; Width = 1251; Height = 713 },
  @{ Name = '15-marble.png'; SourceWidth = 1266; SourceHeight = 713; Width = 1251; Height = 713 },
  @{ Name = '07-opal.png'; SourceWidth = 1266; SourceHeight = 713; Width = 1251; Height = 713 },
  @{ Name = '09-mana.png'; SourceWidth = 1237; SourceHeight = 705; Width = 1237; Height = 690 },
  @{ Name = '20-more-nutrition.png'; SourceWidth = 1261; SourceHeight = 710; Width = 1251; Height = 700 },
  @{ Name = '25-izanami.png'; SourceWidth = 1266; SourceHeight = 713; Width = 1251; Height = 713 },
  @{ Name = '26-ctgt.png'; SourceWidth = 1266; SourceHeight = 713; Width = 1251; Height = 713 }
)

foreach ($crop in $crops) {
  $path = Join-Path $captureRoot $crop.Name
  $source = [System.Drawing.Image]::FromFile($path)

  if ($source.Width -eq $crop.Width -and $source.Height -eq $crop.Height) {
    $source.Dispose()
    Write-Output "Already clean: $($crop.Name)"
    continue
  }

  if ($source.Width -ne $crop.SourceWidth -or $source.Height -ne $crop.SourceHeight) {
    $actual = "$($source.Width)x$($source.Height)"
    $source.Dispose()
    throw "Unexpected dimensions for $($crop.Name): $actual"
  }

  $bitmap = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.DrawImage(
    $source,
    (New-Object System.Drawing.Rectangle 0, 0, $crop.Width, $crop.Height),
    (New-Object System.Drawing.Rectangle 0, 0, $crop.Width, $crop.Height),
    [System.Drawing.GraphicsUnit]::Pixel
  )

  $temporaryPath = "$path.cropped.tmp.png"
  $bitmap.Save($temporaryPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  $source.Dispose()
  Move-Item -LiteralPath $temporaryPath -Destination $path -Force
  Write-Output "Removed scrollbar pixels: $($crop.Name)"
}
