import requests
import json
import time

base_url = "https://api.diltak.ai"

# 1. Register a new employer
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

print("Registering employer...")
r = requests.post(f"{base_url}/api/auth/register", json=reg_payload)
if r.status_code not in (200, 201):
    print("Registration failed:", r.text)
    exit(1)

employer_token = r.json().get("access_token")
headers_emp = {
    "Authorization": f"Bearer {employer_token}",
    "Content-Type": "application/json"
}

# 2. Get company details or create employee
# In openapi, POST /api/employees/create creates a new employee.
# Let's check what payload it expects by looking at the schema or guessing standard fields.
# Standard fields for employee: email, password, firstName, lastName, role, department, jobTitle.
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

print("Creating employee...")
r_create = requests.post(f"{base_url}/api/employees/create", headers=headers_emp, json=create_emp_payload)
print(f"Create employee status: {r_create.status_code}")
print(r_create.text)

if r_create.status_code in (200, 201):
    # 3. Log in as the employee
    print("\nLogging in as employee...")
    login_payload = {
        "email": employee_email,
        "password": password
    }
    r_login = requests.post(f"{base_url}/api/auth/login", json=login_payload)
    print(f"Login status: {r_login.status_code}")
    print("Login response:")
    print(json.dumps(r_login.json(), indent=2))
