import datetime

def get_time():
    now_datetime =  datetime.datetime.strptime(datetime.datetime.now().isoformat(sep=" ", timespec="seconds"), "%Y-%m-%d %H:%M:%S")
    return now_datetime