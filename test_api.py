import urllib.request
from urllib.error import HTTPError
req = urllib.request.Request('https://crypto-sentinel-production-c1e6.up.railway.app/api/scans/stats')
req.add_header('Authorization', 'Bearer test')
try:
    res = urllib.request.urlopen(req)
    print('SUCCESS:', res.read().decode('utf-8'))
except HTTPError as e:
    print('HTTP_ERROR:', e.read().decode('utf-8'))
except Exception as e:
    print('OTHER_ERROR:', str(e))
