import os

domain_path = r"apps\web\src\app\api\scans\domain\route.ts"
with open(domain_path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";', 'const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://crypto-sentinel-production-c1e6.up.railway.app";')
text = text.replace('const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://crypto-sentinel-production-c1e6.up.railway.app";\n    \n    const res = await fetch(`${backendUrl}/api/scans/domain`', 'const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://crypto-sentinel-production-c1e6.up.railway.app";\n    const res = await fetch(`${backendUrl}/api/scans/scan/domain`')

with open(domain_path, "w", encoding="utf-8") as f:
    f.write(text)

repo_path = r"apps\web\src\app\api\scans\repo\route.ts"
with open(repo_path, "r", encoding="utf-8") as f:
    text = f.read()
text = text.replace('const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";', 'const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://crypto-sentinel-production-c1e6.up.railway.app";')
with open(repo_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated repo and domain proxies")
