function getDataCardHistoryes(){
    return [{
            "history_id": 0,
            "history_date": "",
            "history_status": "",
            "history_user": {
            "user_id": 0,
            "user_surname": "",
            "user_division_id": 0,
            "user_salt_for_password": "",
            "user_email": "",
            "user_fathername": "",
            "user_name": "",
            "user_position": "",
            "user_password_hash": "",
            "user_temp_password": false,
            "user_created_at": ""
            },
            "history_comment": ""
        }] /* ОБЩИЙ ОБЪЕКТ для храненения данных истории дефекта !!! ЕСЛИ ПОМЕНЯЕТСЯ API ТО ЗАМЕНИТЬ НА АКТУАЛЬНЫЕ ЗНАЧЕНИЯ */
}

function getDataPlaceholders(){
    return {
        'ЖД оборудования': '##XXX##XX###',
        'ЖД СК и ЗиС': '##XXX##XN##AAAAAA',
        'ЖД по освещению': '##XXX##XX###',
        'ЖД по системам пожаротушения': '##XXX##',
        }
}