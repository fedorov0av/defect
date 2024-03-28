""" import redis
from redis.commands.json.path import Path
import redis.commands.search.aggregation as aggregations
import redis.commands.search.reducers as reducers
from redis.commands.search.field import TextField, NumericField, TagField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.commands.search.query import NumericFilter, Query

r = redis.Redis()
# True
user = {"Name":"Pradeep", "Company":"SCTL", "Address":"Mumbai", "Location":"RCP"}

r.hset('user', mapping=user) """

from redis_dict import RedisDict

user = {"Name":"Pradeep", "Company":"SCTL", "Address":"Mumbai", "Location":"RCP"}
user2 = {"Name2":"Pradeep2", "Company2":"SCTL2", "Address2":"Mumbai2", "Location2":"RCP2"}


dic = RedisDict(host='127.0.0.1', namespace='users')
dic['user'] = user
dic['user2'] = user2

""" print(dic['foo'])  # Output: 42
print('foo' in dic)  # Output: True
dic["baz"] = "hello world"
print(dic)  # Output: {'foo': 42, 'baz': 'hello world'} """

