import subprocess
import json
try:
    git_res = subprocess.run(['git', '--version'], capture_output=True, text=True)
    print('GIT:', git_res.stdout.strip())
except Exception as e:
    print('GIT ERROR:', e)
try:
    sem_res = subprocess.run(['semgrep', '--version'], capture_output=True, text=True)
    print('SEMGREP:', sem_res.stdout.strip())
except Exception as e:
    print('SEMGREP ERROR:', e)
