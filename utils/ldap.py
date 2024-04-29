from ldap3 import Server, Connection, ALL, ASYNC
from ldap3.abstract.entry import Entry
from ldap3.core.exceptions import LDAPBindError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound

from db.division import Division
from db.division_ad import DivisionAD
from db.role import Role
from app.schemas.user import UserAD
from redis_dict import RedisDict


REDIS_SERVER = '172.17.0.6'
REDIS_NAMESPACE = 'users'

SERVER_URI = 'ldaps://akk-s-dc02.mbu.invalid'
ATTRS_ALL = ['*']
ATTRS_USER = ['title', 'description', 'department', 'memberOf', 'extensionAttribute2', 'mail', 'sAMAccountName', 'mailNickname']
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
    """ def __init__(self, session:AsyncSession, username:str, password:str, auth=False) -> None: """
    def __init__(self, session:AsyncSession, username:str, password:str=None, auth=False) -> None:
        self.username = username
        self.password = password
        self.attributes = ['cn', 'description', 'extensionAttribute2', 'extensionAttribute3', 'mail', 'department']
        self.attrs_user = ['title', 'description', 'department', 'memberOf', 'extensionAttribute2', 'mail', 'sAMAccountName', 'mailNickname']
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
                user_sAMAccountName = raw_user['attributes']['sAMAccountName']
                user_departament = raw_user['attributes']['department']
                user_mail = raw_user['attributes']['mail']
                user_mailNickname = raw_user['attributes']['mailNickname']
                user_fio = raw_user['attributes']['extensionAttribute2']
                UsersLDAP.add_user(user_id=user_sAMAccountName.lower(),
                                   value = {
                    'description': raw_user['attributes']['description'][0],
                    'department': user_departament.lower(),
                    'memberOf': raw_user['attributes']['memberOf'],
                    'extensionAttribute2': user_fio if user_fio else raw_user['attributes']['title'],
                    'mail': user_mail.lower(),
                    'mailNickname': user_mailNickname.lower(),
                    'sAMAccountName': user_sAMAccountName.lower(),
                })
            except IndexError as err:
                print('Error Redis ==== ', err)
                print('Ошибка возникла на пользователе ==== ', raw_user)
            except AttributeError as err:
                print('Error Redis ==== ', err)
                print('Ошибка вохникла на пользователе ==== ', raw_user)



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
            if users[user]['mail'] == mail.lower():
                return await self.get_user_from_EntryLDAP(users[user])

    async def get_user_by_attr(self, attr: str) -> UserAD: # получаем пользователя из AD по НАЗВАНИЮ ОТДЕЛА В КИРИЛЛИЦЕ
        users = UsersLDAP.get_users()
        for user in users:
            if users[user]['extensionAttribute3'] == attr:
                return await self.get_user_from_EntryLDAP(users[user])

    async def get_user_by_groupNameAD(self, group_name: str) -> UserAD:
        users = UsersLDAP.get_users()
        result = list()
        for user in users:
            if group_name in users[user]['memberOf']:
                try:
                    userAD = await self.get_user_from_EntryLDAP(users[user])
                except NoResultFound as err:
                    print('erorr ==', err)
                    print('userAD ==', userAD)
                else:
                    result.append(userAD)
        return result
            
    async def get_user_by_dep(self, dep: str) -> UserAD:
        users = UsersLDAP.get_users()
        for user in users:
            if users[user]['department'] == dep.lower():
                return await self.get_user_from_EntryLDAP(users[user])

    async def get_user_by_uid_from_AD(self, user_uid: str) -> Entry:
        users = UsersLDAP.get_users()
        return await self.get_user_from_EntryLDAP(users[user_uid])

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