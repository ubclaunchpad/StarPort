# find all typescript files using windows Get-ChildItem
$tsFiles = Get-ChildItem -Path .\src -Recurse -Filter "*.ts"

if (Test-Path -Path .\dist -PathType Container) {
    # If 'dist' folder exists, clear all subdirs
    Remove-Item -Path .\dist\* -Recurse -Force
}
else {
    # If 'dist' does not exist, create it
    New-Item -Path .\dist -ItemType Directory
}

foreach ($tsFile in $tsFiles) {
    # string operation to get the reletive path after src
    $relativePath = $tsFile.FullName.Substring($tsFile.FullName.IndexOf("src"))
    # prepare entry name, which should not end with .ts
    $entryName = $relativePath -replace '\.ts$', ''
    # prepare the outdir string
    $outdir = Join-Path "dist" $relativePath
    # assemble the command
    $command = " esbuild '$($tsFile.FullName)' --entry-names=$entryName --bundle --platform=node --target=node16.14 --outdir='dist' "
    # call the command
    Invoke-Expression $command
}
