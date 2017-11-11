from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from models import *
from flask import Flask, request
import os
import json

CHROME_HISTORY_PATH = '/Users/matt/Library/Application\ Support/Google/Chrome/Default/History'
LOCAL_CHROME_HISTORY = '/Users/matt/github/Discord-Unix/server/chrome_history'

engine = create_engine('sqlite:///{}'.format(LOCAL_CHROME_HISTORY))
Session = sessionmaker(bind=engine)
session = Session()

app = Flask(__name__)

def update_browser_history():
    os.system("cp {} {}".format(CHROME_HISTORY_PATH, LOCAL_CHROME_HISTORY))

def format_results(query):
    return [{'index': index, 'title': res.title, 'url': res.url} for index, res in enumerate(query)]

def generate_query(token, query):
    if token == 'history':
        query = session.query(Urls).order_by(desc(Urls.last_visit_time))

    elif token == 'tail':
        query = query.limit(5)

    return query

def get_cmd_query_results(tokens):
    query = None
    for token in tokens:
        query = generate_query(token, query)

    return format_results(query)

def execute_cmd(tokens):
    root_cmd = tokens[0]
    
    if root_cmd == 'history':
        update_browser_history()
        engine = create_engine('sqlite:///{}'.format(LOCAL_CHROME_HISTORY))
        Session = sessionmaker(bind=engine)
        session = Session()
        return get_cmd_query_results(tokens)

@app.route('/')
def entry_point():
    cmd_tokens = json.loads(request.args.get('tokens'))
    return json.dumps(execute_cmd(cmd_tokens))

if __name__ == '__main__':
    app.run(port=7000)
