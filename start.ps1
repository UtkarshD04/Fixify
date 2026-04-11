Write-Host "Starting Fixify on Kubernetes..." -ForegroundColor Green

# Start minikube
minikube start

# Check pods
kubectl get pods

# Port forward in separate windows
Start-Process powershell -ArgumentList "kubectl port-forward service/fixify-backend-service 4000:4000"
Start-Process powershell -ArgumentList "kubectl port-forward service/fixify-frontend-service 3000:80"

Write-Host ""
Write-Host "✅ Fixify is running!" -ForegroundColor Green
Write-Host "🌐 Open: http://localhost:3000" -ForegroundColor Cyan
