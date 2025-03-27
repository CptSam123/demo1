from werkzeug.security import generate_password_hash

password = "123456"
hashed = generate_password_hash(password)

print("Hashed password:", hashed)
