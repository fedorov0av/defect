from ldap3 import Server, Connection, ALL, NTLM, ObjectDef, AttrDef, HASHED_SALTED_SHA512, ALL_ATTRIBUTES, MODIFY_ADD, ASYNC
from ldap3.abstract.entry import Entry
from ldap3.core.exceptions import LDAPBindError
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db.division import Division
from db.division_ad import DivisionAD
from db.role import Role
from app.schemas.user import UserAD

SERVER_URI = 'ldaps://akk-s-dc02.mbu.invalid'
ATTRS_ALL = ['*']
ATTRS_USER = ['description', 'department', 'memberOf', 'extensionAttribute2', 'mail', 'sAMAccountName']
SEARCH_BASE = 'ou=Users,ou=_Akkuyu,dc=mbu,dc=invalid'
server = Server(SERVER_URI, get_info=ALL)


def get_user_by_mail(conn: Connection, mail: str) -> List[Entry]:
    conn.search(SEARCH_BASE, f"mail={mail}", attributes=['cn', 'description', 'extensionAttribute2', 'extensionAttribute3', 'mail', 'department'])
    return conn.entries

def get_user_by_attr(conn: Connection, attr) -> List[Entry]:
    conn.search(SEARCH_BASE, f"extensionAttribute3={attr}", attributes=['cn', 'description', 'extensionAttribute2', 'extensionAttribute3', 'mail', 'department'])
    return conn.entries

def get_user_by_dep(conn: Connection, dep) -> List[Entry]:
    conn.search(SEARCH_BASE, f"department={dep}", attributes=['cn', 'description', 'extensionAttribute2', 'extensionAttribute3', 'mail', 'department'])
    return conn.entries

def get_connection_ldap(username: str, password: str) -> Connection:
    ldap_connection = Connection(server, user=f"MBU\\{username}", password=password)
    if ldap_connection.bind():
        return ldap_connection

async def check_user(username: str, password: str) -> bool:
    ldap_connection = Connection(server, user=f"MBU\\{username}", password=password)
    if ldap_connection.bind():
        return True
    else:
        return False

async def get_user_from_EntryLDAP(session: AsyncSession, request: Request, userAD: Entry) -> UserAD:
    user_FIO: str = userAD.description.value
    user_name = user_FIO.split()[1]
    user_fathername = user_FIO.split()[2] if len(user_FIO.split()) == 3 else None
    user_surname = user_FIO.split()[0]
    department_name_from_ad = userAD.department.value
    divisionAD = await DivisionAD.get_divisionAD_by_name(session, department_name_from_ad)
    division = await Division.get_division_by_id(session, divisionAD.divisionAD_division_id)
    role_list = list()
    role = await Role.get_role_by_rolename(session, 'Администратор') # сделать проверку на рабочие группы
    role_list.append(role)
    user = UserAD(
        user_id = userAD.sAMAccountName.value,
        user_name = user_name,
        user_fathername = user_fathername,
        user_surname = user_surname,
        user_position = userAD.extensionAttribute2.value,
        user_division_id = division.division_id,
        user_division = division,
        user_role = role_list,
        user_email = userAD.mail.value,
    )
    return user

async def get_user_by_uid_from_AD(username: str, passw: str, user_uid: str) -> Entry:
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



class LdapConnection:
    def __init__(self, username:str, password:str) -> None:
        self.username = username
        self.password = password
        self.attributes = ['cn', 'description', 'extensionAttribute2', 'extensionAttribute3', 'mail', 'department']
        self.attrs_user = ['description', 'department', 'memberOf', 'extensionAttribute2', 'mail', 'sAMAccountName']
        self.succes_connection = self.start_connection()

    def start_connection(self): # осуществляем соединение
        try:
            self.ldap_connection = Connection(server, user=f"MBU\\{self.username}", password=self.password, client_strategy=ASYNC, auto_bind=True)
            return True
        except LDAPBindError as err:
            return False
        
    async def check_user(self) -> bool: # аутентификация пользователя
            return self.succes_connection

    async def get_user_by_mail(self, mail: str) -> List[Entry]: # получаем пользователя из AD по АДРЕСУ ПОЧТЫ
        message_id =self.ldap_connection.search(SEARCH_BASE, f"(mail={mail})", attributes=self.attributes)
        return self.ldap_connection.get_response(message_id)
    
    
    async def get_user_by_attr(self, attr: str) -> List[Entry]: # получаем пользователя из AD по НАЗВАНИЮ ОТДЕЛА В КИРИЛЛИЦЕ
        self.ldap_connection.search(SEARCH_BASE, f"(extensionAttribute3={attr})", attributes=self.attributes)
        return self.ldap_connection.entries
    
    async def get_user_by_dep(self, dep: str) -> List[Entry]:
        self.ldap_connection.search(SEARCH_BASE, f"(department={dep})", attributes=self.attributes)
        return self.ldap_connection.entries

    async def get_user_by_uid_from_AD(self, user_uid: str) -> Entry:
        if self.ldap_connection.search(SEARCH_BASE, f"(mailNickname={user_uid})", attributes=self.attrs_user):
            return self.ldap_connection.entries[0]
        else: return None

    async def get_users_by_attr3_from_AD(self, attr3: str) -> List[Entry]:
        if self.ldap_connection.bind():
            if self.ldap_connection.search(SEARCH_BASE, f"(extensionAttribute3={attr3})", attributes=ATTRS_USER):
                return self.ldap_connection.entries
            else: return None
        else:
            self.start_connection(self)
            if self.ldap_connection.search(SEARCH_BASE, f"(extensionAttribute3={attr3})", attributes=ATTRS_USER):
                return self.ldap_connection.entries
            else: return None

    async def get_users_by_dep_from_AD(self, departament: str) -> Entry:
        if self.ldap_connection.bind():
            if self.ldap_connection.search(SEARCH_BASE, f"(department={departament})", attributes=ATTRS_USER):
                return self.ldap_connection.entries[0]
            else: return None
        else:
            self.start_connection(self)
            if self.ldap_connection.search(SEARCH_BASE, f"(department={departament})", attributes=ATTRS_USER):
                return self.ldap_connection.entries[0]
            else: return None

    async def get_user_from_EntryLDAP(self, session: AsyncSession, userAD: Entry) -> UserAD:
        user_FIO: str = userAD.description.value
        user_name = user_FIO.split()[1]
        user_fathername = user_FIO.split()[2] if len(user_FIO.split()) == 3 else None
        user_surname = user_FIO.split()[0]
        department_name_from_ad = userAD.department.value
        divisionAD = await DivisionAD.get_divisionAD_by_name(session, department_name_from_ad)
        division = await Division.get_division_by_id(session, divisionAD.divisionAD_division_id)
        role_list = list()
        role = await Role.get_role_by_rolename(session, 'Администратор') # сделать проверку на рабочие группы
        role_list.append(role)
        user = UserAD(
            user_id = userAD.sAMAccountName.value,
            user_name = user_name,
            user_fathername = user_fathername,
            user_surname = user_surname,
            user_position = userAD.extensionAttribute2.value,
            user_division_id = division.division_id,
            user_division = division,
            user_role = role_list,
            user_email = userAD.mail.value,
        )
        return user