from requests import get
from json import loads, dumps

url_sub = 'http://pubsub.pubnub.com/subscribe/sub-c-2dc024b4-c51f-11e4-b3c4-02ee2ddab7fe/test/0/0'

#url_sub = 'http://pubsub.pubnub.com/subscribe/demo/testi/0/0'

resp_sub = get(url_sub)

resp_sub = get(url_sub[:-1] + loads(resp_sub.content)[1])

print resp_sub.content
