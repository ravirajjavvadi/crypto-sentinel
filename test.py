import urllib.request
from urllib.error import HTTPError
req = urllib.request.Request('https://crypto-sentinel-production-c1e6.up.railway.app/api/scans/stats')
req.add_header('Authorization', 'Bearer test')
try:
  print(urllib.request.urlopen(req).read().decode('utf-8'))
except HTTPError as e:
  print('ERROR_BODY:', e.read().decode('utf-8'))
