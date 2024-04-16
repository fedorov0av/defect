from ldap3 import Server, Connection, ALL, ASYNC
from ldap3.abstract.entry import Entry
from ldap3.core.exceptions import LDAPBindError
from sqlalchemy.ext.asyncio import AsyncSession

from db.division import Division
from db.division_ad import DivisionAD
from db.role import Role
from app.schemas.user import UserAD
from redis_dict import RedisDict


REDIS_SERVER = '172.17.0.6'
REDIS_NAMESPACE = 'users'

SERVER_URI = 'ldaps://akk-s-dc02.mbu.invalid'
ATTRS_ALL = ['*']
ATTRS_USER = ['description', 'department', 'memberOf', 'extensionAttribute2', 'mail', 'sAMAccountName']
SEARCH_BASE = 'ou=Users,ou=_Akkuyu,dc=mbu,dc=invalid'

GROUPS_AD_FOR_ROLES = [
    'CN=RegistrarsDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid',
    'CN=OwnersDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid',
    'CN=RepairManagersDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid',
    'CN=WorkersDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid',
    'CN=InspectorsDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid',
    'CN=AdminsDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid',
]

server = Server(SERVER_URI, get_info=ALL)

class UsersLDAP():
    __users: RedisDict = RedisDict(host=REDIS_SERVER, namespace=REDIS_NAMESPACE)

    @classmethod
    def get_users(cls) -> dict[dict[dict]]:
        return UsersLDAP.__users
    
    @classmethod
    def add_user(cls, user_id: str, value:dict):
        UsersLDAP.__users[user_id] = value


class LdapConnection:
    def __init__(self, session:AsyncSession, username:str, password:str, auth=False) -> None:
        self.username = username
        self.password = password
        self.attributes = ['cn', 'description', 'extensionAttribute2', 'extensionAttribute3', 'mail', 'department']
        self.attrs_user = ['description', 'department', 'memberOf', 'extensionAttribute2', 'mail', 'sAMAccountName', 'mailNickname']
        if auth:
            self.succes_connection = self.start_connection()
        self.users = {}
        self.session = session

    def start_connection(self) -> bool: # осуществляем соединение
        try:
            self.ldap_connection = Connection(server, user=f"MBU\\{self.username}", password=self.password, client_strategy=ASYNC, auto_bind=True)
            if not UsersLDAP.get_users():
                self.update_users()
            return True
        except LDAPBindError as err:
            return False

    def get_connection(self) -> Connection:
        self.start_connection()

    async def check_user(self) -> bool: # аутентификация пользователя    
        return self.succes_connection

    def update_users(self):
        con = self.ldap_connection
        message_id = con.search(SEARCH_BASE, f"(objectclass=person)", attributes=self.attrs_user)
        raw_users = con.get_response(message_id)[0]
        for raw_user in raw_users:
            try:
                UsersLDAP.add_user(user_id=[raw_user['attributes']['sAMAccountName']],
                                   value = {
                    'description': raw_user['attributes']['description'][0],
                    'department': raw_user['attributes']['department'],
                    'memberOf': raw_user['attributes']['memberOf'],
                    'extensionAttribute2': raw_user['attributes']['extensionAttribute2'],
                    'mail': raw_user['attributes']['mail'],
                    'mailNickname': raw_user['attributes']['mailNickname'],
                    'sAMAccountName': raw_user['attributes']['sAMAccountName'],
                })
            except IndexError as err:
                print('err=== ', err)

    async def get_user_by_mail_from_AD(self, mail: str) -> Entry: # получение пользователя с AD по mail
        message_id = self.ldap_connection.search(SEARCH_BASE, f"(mail={mail})", attributes=ATTRS_USER)
        raw_user = self.ldap_connection.get_response(message_id)[0][0]
        user = raw_user['attributes']
        if user:
            return user
        else: return None

    async def get_user_by_mail(self, mail: str) -> UserAD: # получаем пользователя из AD по АДРЕСУ ПОЧТЫ
        users = UsersLDAP.get_users()
        for user in users:
            if users[user]['mail'] == mail:
                return await self.get_user_from_EntryLDAP(users[user])

    async def get_user_by_attr(self, attr: str) -> UserAD: # получаем пользователя из AD по НАЗВАНИЮ ОТДЕЛА В КИРИЛЛИЦЕ
        users = UsersLDAP.get_users()
        for user in users:
            if users[user]['extensionAttribute3'] == attr:
                return await self.get_user_from_EntryLDAP(users[user])

    async def get_user_by_dep(self, dep: str) -> UserAD:
        users = UsersLDAP.get_users()
        for user in users:
            if users[user]['department'] == dep:
                return await self.get_user_from_EntryLDAP(users[user])

    async def get_user_by_uid_from_AD(self, user_uid: str) -> Entry:
        users = UsersLDAP.get_users()
        return await self.get_user_from_EntryLDAP(users[[user_uid]])

    async def get_user_from_EntryLDAP(self, userAD: dict) -> UserAD:
        user_FIO: str = userAD['description']
        user_name = user_FIO.split()[1]
        user_fathername = user_FIO.split()[2] if len(user_FIO.split()) == 3 else None
        user_surname = user_FIO.split()[0]
        department_name_from_ad = userAD['department']
        divisionAD = await DivisionAD.get_divisionAD_by_name(self.session, department_name_from_ad)
        division = await Division.get_division_by_id(self.session, divisionAD.divisionAD_division_id)
        role_list = list()
        memberOfAD = userAD['memberOf']
        for role_group_name_AD in GROUPS_AD_FOR_ROLES:
            if role_group_name_AD in memberOfAD:
                role = await Role.get_role_by_role_group_name_AD(self.session, role_group_name_AD) # сделать проверку на рабочие группы
                role_list.append(role)
        user = UserAD(
            user_id = userAD['sAMAccountName'],
            user_name = user_name,
            user_fathername = user_fathername,
            user_surname = user_surname,
            user_position = userAD['extensionAttribute2'],
            user_division_id = division.division_id,
            user_division = division,
            user_role = role_list,
            user_email = userAD['mail'],
        )
        return user
    

""" def get_connection_ldap(username: str, password: str) -> Connection:
    ldap_connection = Connection(server, user=f"MBU\\{username}", password=password)
    if ldap_connection.bind():
        return ldap_connection """

""" async def check_user(username: str, password: str) -> bool: # ИСПОЛЬЗУЕТСЯ В API AUTH
    ldap_connection = Connection(server, user=f"MBU\\{username}", password=password)
    if ldap_connection.bind():
        return True
    else:
        return False
 """
""" async def get_user_by_uid_from_AD(username: str, passw: str, user_uid: str) -> Entry:
    ldap_connection = get_connection_ldap(username, passw)
    if ldap_connection.search(SEARCH_BASE, f"(mailNickname={user_uid})", attributes=ATTRS_USER):
        return ldap_connection.entries[0]
    else: return None

async def get_users_by_attr3_from_AD(username: str, passw: str, attr3: str) -> List[Entry]: # fix me
    ldap_connection = get_connection_ldap(username, passw)
    if ldap_connection.search(SEARCH_BASE, f"(extensionAttribute3={attr3})", attributes=ATTRS_USER):
        return ldap_connection.entries
    else: return None

async def get_users_by_dep_from_AD(username: str, passw: str, departament: str) -> Entry: # fix me
    ldap_connection = get_connection_ldap(username, passw)
    if ldap_connection.search(SEARCH_BASE, f"(department={departament})", attributes=ATTRS_USER):
        return ldap_connection.entries[0]
    else: return None
 """