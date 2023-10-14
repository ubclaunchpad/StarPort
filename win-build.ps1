$tsFiles = Get-ChildItem -Path .\src -Recurse -Filter "*.ts"

foreach ($tsFile in $tsFiles) {
    $relativePath = $tsFile.FullName.Substring($tsFile.FullName.IndexOf("src"))
    $entryName = [System.IO.Path]::ChangeExtension($relativePath, ".js")
    $outdir = Join-Path "dist" $entryName
    $command = "esbuild '$($tsFile.FullName)' --entry-names=$entryName --bundle --platform=node --target=node16.14 --outdir='$outdir'"
    Invoke-Expression $command
}
