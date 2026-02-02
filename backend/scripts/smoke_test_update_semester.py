#!/usr/bin/env python3
"""
Smoke test: log in as default admin (user_number=admin, password=admin),
fetch active semester, then PUT updated min_units/max_units.
"""
import json
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:8000"
LOGIN_URL = BASE + "/auth/login"
ACTIVE_SEM_URL = BASE + "/semesters/active/current"

ADMIN_CREDENTIALS = {"user_number": "admin", "password": "admin"}

def post_json(url, data, headers=None):
    headers = headers or {}
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json", **headers}, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.load(resp)

def get_json(url, headers=None):
    headers = headers or {}
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.load(resp)

def put_json(url, data, headers=None):
    headers = headers or {}
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json", **headers}, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.load(resp)


def main():
    try:
        code, body = post_json(LOGIN_URL, ADMIN_CREDENTIALS)
    except urllib.error.HTTPError as e:
        print(f"Login HTTPError: {e.code} {e.reason}")
        try:
            print(e.read().decode())
        except Exception:
            pass
        return
    except Exception as e:
        print("Login error:", e)
        return

    token = body.get("access_token")
    if not token:
        print("No access_token received:", body)
        return

    headers = {"Authorization": f"Bearer {token}"}

    try:
        code, sem = get_json(ACTIVE_SEM_URL, headers=headers)
    except urllib.error.HTTPError as e:
        print(f"GET active semester HTTPError: {e.code} {e.reason}")
        try:
            print(e.read().decode())
        except Exception:
            pass
        return

    sem_id = sem.get("id")
    print("Active semester:", json.dumps(sem, indent=2))
    if not sem_id:
        print("No semester id in response")
        return

    # Prepare update: toggle min/max by +1 (safe small change)
    cur_min = sem.get("min_units", 0)
    cur_max = sem.get("max_units", cur_min)
    new_min = max(0, cur_min + 1)
    new_max = cur_max + 1 if cur_max >= new_min else new_min + 1

    payload = {"min_units": new_min, "max_units": new_max}
    put_url = f"{BASE}/semesters/{sem_id}"
    print(f"PUT {put_url} with payload: {payload}")

    try:
        code, resp = put_json(put_url, payload, headers=headers)
    except urllib.error.HTTPError as e:
        print(f"PUT HTTPError: {e.code} {e.reason}")
        try:
            print(e.read().decode())
        except Exception:
            pass
        return
    except Exception as e:
        print("PUT error:", e)
        return

    print("PUT response code:", code)
    print("PUT response body:", json.dumps(resp, indent=2))

if __name__ == '__main__':
    main()
