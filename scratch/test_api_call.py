import requests
import json
import time

base_url = "https://api.diltak.ai"

# Let's register a new user
timestamp = int(time.time())
email = f"test_emp_{timestamp}@example.com"
password = "supersecretpassword123"

reg_payload = {
    "email": email,
    "password": password,
    "firstName": "Test",
    "lastName": "User",
    "companyName": "Test Company",
    "companySize": "10-50",
    "industry": "Technology"
}

print("Registering user...")
r = requests.post(f"{base_url}/api/auth/register", json=reg_payload)
if r.status_code not in (200, 201):
    print("Registration failed:", r.text)
    exit(1)

res_data = r.json()
access_token = res_data.get("access_token")

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Fetch profile to get ID
r_me = requests.get(f"{base_url}/api/auth/me", headers=headers)
me_data = r_me.json()
user_id = me_data.get("uid") or me_data.get("id")
company_id = me_data.get("company_id") or me_data.get("companyId")

print(f"User: {user_id}, Company: {company_id}")

# Let's create a report
# We need to know the schema for POST /api/reports. Let's send a basic payload.
report_payload = {
    "mood_rating": 8,
    "stress_level": 3,
    "energy_level": 7,
    "overall_wellness": 8,
    "work_satisfaction": 9,
    "notes": "Feeling great today!",
    "risk_level": "low"
}

print("Creating wellness report...")
r_report = requests.post(f"{base_url}/api/reports", headers=headers, json=report_payload)
print(f"Create Report Status: {r_report.status_code}")
print(r_report.text)

# Now fetch recent reports
params = {
    "companyId": company_id,
    "userId": user_id,
    "days": 30
}

print("\nFetching /api/reports/recent...")
r_recent = requests.get(f"{base_url}/api/reports/recent", headers=headers, params=params)
print(f"Status: {r_recent.status_code}")
try:
    recent_data = r_recent.json()
    print("Response data:")
    print(json.dumps(recent_data, indent=2))
except Exception as e:
    print(f"Error parsing response: {e}")
    print(r_recent.text)
