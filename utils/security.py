import bcrypt

def get_hash_salt(password:str) -> tuple[str, str]:
    salt: bytes = bcrypt.gensalt(12)
    password_b: bytes = password.encode()
    hashed: bytes = bcrypt.hashpw(password_b, salt)
    return hashed.decode(), salt.decode()

def check_password(user, text:str) -> bool: # user: db.user.User
    text_bytes: bytes = text.encode("utf-8")
    if bcrypt.checkpw(text_bytes, user.user_password_hash.encode()):
        return True
    else:
        return False

if __name__ == "__main__":
    pass
