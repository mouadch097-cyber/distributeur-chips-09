# Read DATABASE_URL from .env.local and write to .env for Prisma CLI
$content = Get-Content '.env.local'
$dbLine = $content | Where-Object { $_.StartsWith('DATABASE_URL=') }
if ($dbLine) {
    Set-Content -Path '.env' -Value $dbLine
    Write-Host "Created .env with DATABASE_URL for Prisma CLI"
} else {
    Write-Host "ERROR: DATABASE_URL not found in .env.local"
    exit 1
}
