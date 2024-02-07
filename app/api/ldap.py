from ldap3 import Server, Connection, ALL, NTLM, ObjectDef, AttrDef, HASHED_SALTED_SHA512, ALL_ATTRIBUTES, MODIFY_ADD

SERVER_URI = 'ldaps://ldap.mbu.invalid'
ATTRS = ['*']
SEARCH_BASE = 'ou=Users,ou=_Akkuyu,dc=mbu,dc=invalid'
server = Server(SERVER_URI, get_info=ALL)

async def check_user(username: str, password: str):
    ldap_connection = Connection(server, user=f"uid={username},ou=users,dc=mdu,dc=invalid", password=password)
    if ldap_connection.bind():
        print('Тамам!')
        ldap_connection.search(f"uid={username},"+SEARCH_BASE, "(objectClass=people)", attributes=ATTRS)
        print(ldap_connection.entries[0])
        print(ldap_connection.user)
    else:
        print('Не удалось авторизоваться!')

async def search_user_by_uid(user_uid: str):
    ldap_connection = Connection(server, user=f"uid={user_uid},ou=users,dc=mdu,dc=invalid", auto_bind=True)
    if not ldap_connection.search(f"uid={user_uid},ou=users,dc=mdu,dc=invalid", "(objectClass=people)", attributes=ATTRS):
            print('Не удалось создать учётную запись в AD')
    else: print(ldap_connection.entries)