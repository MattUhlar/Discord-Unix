'use strict';

let fs = require('fs');
let _ = require('underscore');
let Discrord = require('discord.io');
let logger = require('winston');
let auth = require('../auth.json');
let app = require('http').createServer()
let io = require('socket.io')(app);

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {colorize: true});
logger.level = 'debug';

app.listen(8000);

const START_CMD_PREFIX = '>_';
const BANG_CMD_PREFIX = '!';
const TAIL_RESULT_COUNT = 5;
const HEAD_RESULT_COUNT = 5;

const bot = new Discrord.Client({
	token: auth.token,
	autorun: true
});

const cmd_func_map = {
	"tail": tail,
	"head": head,
	"|": pipe
};

function valid_cmd_prefix(cmd) {
	return cmd.substring(0, START_CMD_PREFIX.length) == START_CMD_PREFIX ||
		   cmd.substring(0, BANG_CMD_PREFIX.length) == BANG_CMD_PREFIX;
}

function get_cmd_prefix(cmd) {
	if (cmd.substring(0, START_CMD_PREFIX.length) == START_CMD_PREFIX) {
		return START_CMD_PREFIX;
	}
	return BANG_CMD_PREFIX;
}

function tokenize(cmd) {
	let tokens = cmd.substring(START_CMD_PREFIX.length, cmd.length).split(' ')
	return tokens.filter(token => token).map(token => token.toLowerCase())
}

function handle_bang_cmd(msg, channel_id) {
	let target_cmd = parseInt(msg.substring(1, msg.length));
	let url = curr_results[target_cmd - 1].url
	send_message(url, channel_id)
}

function valid_cmd(tokens, err) {
	return true;
}

bot.on('ready', (e) => {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' -(' + bot.id + ')');
});

function send_message(msg, channel_id) {
	bot.sendMessage({to: channel_id, message: msg});
}

function format_response(response) {	
	let res = "";

	response.forEach((el, idx) => {
		res += idx + 1;
		res += '.\t' + el.title + '\n';
	});

	return res;
}

function tail(data) {
	if (data.res.length >= TAIL_RESULT_COUNT) {
		data.res = data.res.slice(0, TAIL_RESULT_COUNT);
	}
	return data;
}

function head(data) {
	if (data.res.length >= HEAD_RESULT_COUNT) {
		data.res = data.res.slice(data.res.length - HEAD_RESULT_COUNT);
	}
	return data;
}

function pipe(data) {
	return data;
}

function _compose(f, g) {
	return (...args) => g(f(...args))
}

function compose(funcs, data) {
	let _data = {res: data};
	return funcs.reduce(_compose)(_data);
}

function build_cmd_pipeline(cmd_tokens) {
	return cmd_tokens.map(cmd => cmd_func_map[cmd]);
}

io.on('connection', function (socket) {
	logger.info('Socket Connected');

	let get_history = (callback) => {
		socket.emit('history', {data: ''});
		socket.on('history_response', (response) => {
			callback(response.data.history);
		});
	}

	function execute_cmd(cmd_tokens, channel_id) {
		let root_cmd = cmd_tokens[0];
		let cmd_pipeline = build_cmd_pipeline(cmd_tokens.slice(1));
		let callback = (data) => {
			let raw_response = compose(cmd_pipeline, data);
			let formated_response = format_response(raw_response.res);
			send_message(formated_response, channel_id);
		}

		if (root_cmd == "history") {
			get_history(callback);
		}
	}

	function handle_start_cmd(msg, channel_id) {
		let err = {msg: ''};
		let tokens = tokenize(msg);
		valid_cmd(tokens, err) ? execute_cmd(tokens, channel_id) : send_message(err.msg, channel_id);
	}

	bot.on('message', (user, user_id, channel_id, msg, evnt) => {
		if (valid_cmd_prefix(msg)) {
			switch (get_cmd_prefix(msg)) {
				case START_CMD_PREFIX:
					handle_start_cmd(msg, channel_id);
					break;
				case BANG_CMD_PREFIX:
					handle_bang_cmd(msg, channel_id);
					break;
			}
		}
	});
});
