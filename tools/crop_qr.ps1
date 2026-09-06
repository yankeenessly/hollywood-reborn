Add-Type -AssemblyName System.Drawing

function Crop-WhiteCard($imgPath, $outPath) {
    $src = [System.Drawing.Bitmap]::FromFile($imgPath)
    $w = $src.Width
    $h = $src.Height

    # Find the top, bottom, left, right of the big white card containing the QR code
    # We look for the main white block (RGB > 240)
    $minX = 9999; $maxX = 0; $minY = 9999; $maxY = 0

    for ($y = 120; $y -lt 620; $y++) {
        for ($x = 60; $x -lt ($w - 60); $x++) {
            $p = $src.GetPixel($x, $y)
            if ($p.R -gt 230 -and $p.G -gt 230 -and $p.B -gt 230) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    Write-Host "Card detected at: X: $minX to $maxX (w=$($maxX-$minX)), Y: $minY to $maxY (h=$($maxY-$minY))"
    $pad = 2
    $cw = ($maxX - $minX)
    $ch = ($maxY - $minY)
    
    # Make it a clean square if it's virtually square
    $side = [Math]::Max($cw, $ch)
    $rect = New-Object System.Drawing.Rectangle($minX, $minY, $cw, $ch)
    $bmp = New-Object System.Drawing.Bitmap($cw, $ch)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "Saved $outPath"
}

Crop-WhiteCard "D:\cc\frontend\public\qr\btc_raw.jpg" "D:\cc\frontend\public\qr\btc_qr.png"
Crop-WhiteCard "D:\cc\frontend\public\qr\usdt_bsc_raw.jpg" "D:\cc\frontend\public\qr\usdt_bsc_qr.png"
Crop-WhiteCard "D:\cc\frontend\public\qr\usdt_trx_raw.jpg" "D:\cc\frontend\public\qr\usdt_trx_qr.png"
