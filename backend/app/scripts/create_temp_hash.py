from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")  # or bcrypt if used

hashed = pwd_context.hash("SuperSecret123")
print(hashed)