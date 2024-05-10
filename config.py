from dotenv import load_dotenv
from os import getenv

load_dotenv()
AD = getenv("AD") == 'True'