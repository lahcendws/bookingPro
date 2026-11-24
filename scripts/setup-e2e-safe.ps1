# Attendre que Supabase soit prêt
Write-Host "⏳ Vérification de l'état de Supabase..."
do {
    Start-Sleep -Seconds 5
    $services = supabase status 2>&1
    $dbStatus = $services | Select-String "db_bookingPro"
    $authStatus = $services | Select-String "auth_bookingPro"
    Write-Host "  DB: $($dbStatus.Line)"
    Write-Host "  Auth: $($authStatus.Line)"
} while ($null -eq $dbStatus -or $null -eq $authStatus)

# Attendre 10 secondes supplémentaires
Write-Host "⏳ Attente supplémentaire 10s..."
Start-Sleep -Seconds 10

# Récupérer la service role key
$key = (supabase status | Select-String "service_role").Line -replace ".*service_role\s+", ""
if (-not $key) {
    Write-Host "❌ Service role key non trouvée"
    exit 1
}

$env:SUPABASE_SERVICE_ROLE_KEY = $key

# Vérifier si les utilisateurs existent déjà
Write-Host "🔍 Vérification des utilisateurs..."
$owners = docker exec supabase_db_bookingPro psql -U postgres -d postgres -t -c "SELECT email FROM auth.users WHERE email = 'e2e-owner@test.invalid';" 2>$null
$employees = docker exec supabase_db_bookingPro psql -U postgres -d postgres -t -c "SELECT email FROM auth.users WHERE email = 'e2e-employee@test.invalid';" 2>$null

if ($owners -and $employees) {
    Write-Host "✅ Utilisateurs E2E existants déjà"
} else {
    Write-Host "👤 Création des utilisateurs E2E..."
    node scripts/create-test-users.js
}

# Exécuter le seed SQL
Write-Host "📦 Exécution du seed SQL..."
Get-Content .supabase\seed\e2e-test-data.sql -Raw | docker exec -i supabase_db_bookingPro psql -v ON_ERROR_STOP=1 -U postgres -d postgres

Write-Host "✅ Setup E2E terminé!"