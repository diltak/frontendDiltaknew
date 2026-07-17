import requests
import json
import time

base_url = "https://api.diltak.ai"

# Let's register an employer first, create an employee, and log in
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

# Log in as the employee
login_payload = {
    "email": employee_email,
    "password": password
}
r_login = requests.post(f"{base_url}/api/auth/login", json=login_payload)
employee_token = r_login.json().get("access_token")

# Call /api/auth/me
headers_me = {
    "Authorization": f"Bearer {employee_token}"
}
r_me = requests.get(f"{base_url}/api/auth/me", headers=headers_me)
print("Employee /api/auth/me status:", r_me.status_code)
print("Employee /api/auth/me response:")
print(json.dumps(r_me.json(), indent=2))
