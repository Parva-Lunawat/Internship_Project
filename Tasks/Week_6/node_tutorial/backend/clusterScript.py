import threading
import requests
import time

# Cluster server runs on 4000 based on your code
BASE_URL = "http://localhost:4000"

# def run_demo():
#     print("\n--- Light before/together Heavy ---")
    
#     # Light Request
#     start = time.perf_counter()
#     res = requests.get(f"{BASE_URL}/api/test1").json()
#     print(f"Light finished in {time.perf_counter() - start:.4f}s (PID: {res['workerPid']})")

#     # Heavy Request
#     start = time.perf_counter()
#     res = requests.get(f"{BASE_URL}/api/heavy").json()
#     print(f"Heavy finished in {time.perf_counter() - start:.2f}s (PID: {res['workerPid']})")

def call_heavy():
    print("\n[1/2] Sending HEAVY request to Cluster...")
    start = time.time()
    try:
        with requests.Session() as s:
            response = s.get(f"{BASE_URL}/api/heavy").json()
        duration = time.time() - start
        print(f"HEAVY finished in {duration:.2f}s (Worker PID: {response['workerPid']})")
    except Exception as e:
        print(f"HEAVY Error: {e}")

def call_light():
    time.sleep(1) 
    print("[2/2] Sending LIGHT request while heavy is running...")
    start = time.time()
    try:
        with requests.Session() as s:
            response = s.get(f"{BASE_URL}/api/test1").json()
        duration = time.time() - start
        print(f"LIGHT finished in {duration:.4f}s (Worker PID: {response['workerPid']})")
    except Exception as e:
        print(f"LIGHT Error: {e}")

def run_demo_2():
    print("\n--- Light Before/Together Heavy---")
    t1 = threading.Thread(target=call_light)
    t2 = threading.Thread(target=call_heavy)
    
    t1.start()
    t1.join()
    t2.start()
    t2.join()

def run_demo_rev():
    print("\n--- Heavy Before/Together Light---")
    t1 = threading.Thread(target=call_heavy)
    t2 = threading.Thread(target=call_light)
        
    t1.start()
    t2.start()
    
    t1.join()
    t2.join()

if __name__ == "__main__":
    run_demo_2()
    run_demo_rev()