import threading
import requests
import time

BASE_URL = "http://localhost:3000"


# def run_demo():
#     print("--- Light before Heavy ---")

#     # Light Request
#     print("\n[1/2] Sending LIGHT request (test1)...")
#     start_light = time.perf_counter()
#     try:
#         requests.get(f"{BASE_URL}/api/test1")
#         duration_light = time.perf_counter() - start_light
#         print(f" LIGHT finished in {duration_light:.2f}s (Should be very fast)")
#     except Exception as e:
#         print(f" Error: {e}")

#     # Heavy Request
#     print("\n[2/2] Sending HEAVY request...")
#     start_heavy = time.perf_counter()
#     try:
#         requests.get(f"{BASE_URL}/api/heavy")
#         duration_heavy = time.perf_counter() - start_heavy
#         print(f"HEAVY finished in {duration_heavy:.2f}s")
#     except Exception as e:
#         print(f"Error: {e}")

def call_heavy():
    print("[1/2] Sending HEAVY request... (This will block the server)")
    start = time.time()
    requests.get(f"{BASE_URL}/api/heavy")
    print(f"[1/2] HEAVY request finished in {time.time() - start:.2f}s")

def call_test1():
    time.sleep(0.5)
    print("[2/2] Sending LIGHT request (test1) while heavy is running...")
    start = time.time()
    requests.get(f"{BASE_URL}/api/test1")
    print(f"[2/2] LIGHT request (test1) finished after {time.time() - start:.2f}s")

def run_demo_2():
    print("--- Light before Heavy ---")

    t1 = threading.Thread(target=call_test1)
    t2 = threading.Thread(target=call_heavy)
    t1.start()
    t1.join()
    t2.start()
    t2.join()

def run_demo_rev():
    print("--- Heavy before light ---")

    t1 = threading.Thread(target=call_heavy)
    t2 = threading.Thread(target=call_test1)
    t1.start()
    t2.start()
    t1.join()
    t2.join()

if __name__ == "__main__":
    run_demo_2()
    run_demo_rev()

