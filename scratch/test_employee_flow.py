import requests
import json
import time

base_url = "https://api.diltak.ai"

# 1. Register employer & create employee
timestamp = int(time.time())
employer_email = f"employer_{timestamp}@example.com"
password = "supersecretpassword123"

reg_payload = {
    "email": employer_email,
    "password": password,
    "firstName": "Boss",
    "lastName": "User",
    "companyName": "Diltak Corp",
    "companySize": "10-50",
    "industry": "Technology"
}

r = requests.post(f"{base_url}/api/auth/register", json=reg_payload)
employer_token = r.json().get("access_token")
headers_emp = {
    "Authorization": f"Bearer {employer_token}",
    "Content-Type": "application/json"
}

employee_email = f"employee_{timestamp}@example.com"
create_emp_payload = {
    "email": employee_email,
    "password": password,
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "department": "Engineering",
    "jobTitle": "Software Engineer"
}

r_create = requests.post(f"{base_url}/api/employees/create", headers=headers_emp, json=create_emp_payload)

# 2. Log in as employee
login_payload = {
    "email": employee_email,
    "password": password
}
r_login = requests.post(f"{base_url}/api/auth/login", json=login_payload)
employee_token = r_login.json().get("access_token")
headers_me = {
    "Authorization": f"Bearer {employee_token}",
    "Content-Type": "application/json"
}

# Get employee profile
r_me = requests.get(f"{base_url}/api/auth/me", headers=headers_me)
me_data = r_me.json()
user_id = me_data.get("uid")
company_id = me_data.get("company_id")

print(f"Employee User ID: {user_id}")
print(f"Employee Company ID: {company_id}")

# 3. Create a report as employee
report_payload = {
    "mood_rating": 8,
    "stress_level": 3,
    "energy_level": 7,
    "overall_wellness": 8,
    "work_satisfaction": 9,
    "notes": "Employee check-in notes",
    "risk_level": "low"
}

r_report = requests.post(f"{base_url}/api/reports", headers=headers_me, json=report_payload)
print(f"Create report status: {r_report.status_code}")
print(r_report.text)

# 4. Fetch /api/reports/recent as employee
params = {
    "companyId": company_id,
    "userId": user_id,
    "days": 30
}
r_recent = requests.get(f"{base_url}/api/reports/recent", headers=headers_me, params=params)
print(f"Fetch recent status: {r_recent.status_code}")
print("Fetch recent response:")
print(json.dumps(r_recent.json(), indent=2))
