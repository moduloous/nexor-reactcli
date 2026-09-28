Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\chira\.gemini\antigravity-ide\brain\b289a694-b157-459c-9a64-6bbb163cd53b\media__1788241814463.png"
$resDir = "C:\Users\chira\Desktop\app\Nexor\android\app\src\main\res"

$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

try {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    
    foreach ($size in $sizes.GetEnumerator()) {
        $folder = $size.Name
        $dim = $size.Value
        
        $bmp = New-Object System.Drawing.Bitmap($dim, $dim)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        
        # High quality scaling
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        
        $g.Clear([System.Drawing.Color]::Transparent)
        
        # Scale the original image to the target size
        $scaledImg = New-Object System.Drawing.Bitmap($img, $dim, $dim)
        $brush = New-Object System.Drawing.TextureBrush($scaledImg)
        
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $dim, $dim)
        
        $g.FillPath($brush, $path)
        
        $targetDir = Join-Path $resDir $folder
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        }
        
        $targetPath1 = Join-Path $targetDir "ic_launcher.png"
        $targetPath2 = Join-Path $targetDir "ic_launcher_round.png"
        
        $bmp.Save($targetPath1, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save($targetPath2, [System.Drawing.Imaging.ImageFormat]::Png)
        
        Write-Host "Saved $targetPath1"
        
        $g.Dispose()
        $brush.Dispose()
        $path.Dispose()
        $scaledImg.Dispose()
        $bmp.Dispose()
    }
    $img.Dispose()
} catch {
    Write-Error $_
}
