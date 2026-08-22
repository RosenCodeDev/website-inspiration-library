param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$appRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $appRoot
$sourceImages = Join-Path $workspaceRoot 'Example Websites Images'
$originalTarget = Join-Path $appRoot 'public\assets\originals'
$captureSource = Join-Path $appRoot 'public\assets\site-captures'
$posterTarget = Join-Path $appRoot 'public\assets\posters'
$motionTarget = Join-Path $appRoot 'public\assets\motion'

New-Item -ItemType Directory -Path $originalTarget -Force | Out-Null
New-Item -ItemType Directory -Path $posterTarget -Force | Out-Null
New-Item -ItemType Directory -Path $motionTarget -Force | Out-Null

Get-ChildItem -LiteralPath $sourceImages -File | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $originalTarget $_.Name) -Force
}

function New-CroppedPoster {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
  )

  $width = 1600
  $height = 1000
  $image = [System.Drawing.Image]::FromFile($Source)
  $targetRatio = $width / $height
  $sourceRatio = $image.Width / $image.Height

  if ($sourceRatio -gt $targetRatio) {
    $cropHeight = $image.Height
    $cropWidth = [int]($cropHeight * $targetRatio)
    $cropX = [int](($image.Width - $cropWidth) / 2)
    $cropY = 0
  } else {
    $cropWidth = $image.Width
    $cropHeight = [int]($cropWidth / $targetRatio)
    $cropX = 0
    $cropY = 0
  }

  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.DrawImage(
    $image,
    (New-Object System.Drawing.Rectangle 0, 0, $width, $height),
    (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropWidth, $cropHeight),
    [System.Drawing.GraphicsUnit]::Pixel
  )

  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    [long]92
  )
  $bitmap.Save($Destination, $encoder, $parameters)

  $parameters.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  $image.Dispose()
}

for ($index = 1; $index -le 18; $index++) {
  $source = Get-ChildItem -LiteralPath $originalTarget -File |
    Where-Object { $_.BaseName -eq [string]$index } |
    Select-Object -First 1

  if ($index -eq 13) {
    $sourcePath = Join-Path $captureSource '13-linq.png'
  } elseif ($index -eq 15) {
    $sourcePath = Join-Path $captureSource '15-marble.png'
  } else {
    $sourcePath = $source.FullName
  }

  New-CroppedPoster -Source $sourcePath -Destination (
    Join-Path $posterTarget ('image-{0:D2}.jpg' -f $index)
  )
}

$siteCaptures = Get-ChildItem -LiteralPath $captureSource -Filter '*.png' |
  Where-Object { $_.Name -match '^\d{2}-' -and $_.Name -notin @('13-linq.png', '15-marble.png') }

foreach ($capture in $siteCaptures) {
  $number = [int]$capture.Name.Substring(0, 2)
  New-CroppedPoster -Source $capture.FullName -Destination (
    Join-Path $posterTarget ('site-{0:D2}.jpg' -f $number)
  )
}

$notomMotion = 'C:\Users\hrose\AppData\Local\Temp\browser-use\assets\ff451c60-8613-426e-ad0b-df3165ce0c28\ada4251e95e91f71.mp4'
if (Test-Path -LiteralPath $notomMotion) {
  Copy-Item -LiteralPath $notomMotion -Destination (Join-Path $motionTarget 'notom-hero.mp4') -Force
}

Write-Output 'Media derivatives generated. Original source files were copied without modification.'
