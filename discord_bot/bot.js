'use strict';

let Discrord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');
let axios = require('axios');
let bot = new Discrord.Client({
	token: auth.token,
	autorun: true
});

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {colorize: true});
logger.level = 'debug';

const INIT_CMD_PREFIX = '>_';
const RESPONSE_CMD_PREFIX = '!';

let curr_results = []

function valid_cmd_prefix(cmd) {
	return cmd.substring(0, INIT_CMD_PREFIX.length) == INIT_CMD_PREFIX ||
		   cmd.substring(0, RESPONSE_CMD_PREFIX.length) == RESPONSE_CMD_PREFIX;
}

function get_cmd_prefix(cmd) {
	if (cmd.substring(0, INIT_CMD_PREFIX.length) == INIT_CMD_PREFIX) {
		return INIT_CMD_PREFIX;
	}
	return RESPONSE_CMD_PREFIX;
}

function tokenize(cmd) {
	let tokens = cmd.substring(INIT_CMD_PREFIX.length, cmd.length).split(' ')
	return tokens.filter(token => token).map(token => token.toLowerCase())
}

function send_message(msg, channel_id) {
	bot.sendMessage({to: channel_id, message: msg});
}

function valid_cmd(tokens, err) {
	return true;
}

function format_response(response) {	
	return response.reduce((acc, res) => {
		acc += res.index + 1;
		acc += '.\t' + res.title + '\n';
		return acc;
	}, '');
}

function execute_cmd(cmd_tokens, channel_id) {
	const url = "http://localhost:7000";
	axios.get(url, {
		params: {
			tokens: JSON.stringify(cmd_tokens)
		}
	}).then(response => {
		curr_results = response.data;
		send_message(format_response(response.data), channel_id);
	}).catch(err => {
		console.log(err);
	});
}

function handle_init_cmd(msg, channel_id) {
	let err = {msg: ''};
	let tokens = tokenize(msg);
	valid_cmd(tokens, err) ? execute_cmd(tokens, channel_id) : send_message(err.msg, channel_id);
}

function handle_response_cmd(msg, channel_id) {
	let target_cmd = parseInt(msg.substring(1, msg.length));
	let url = curr_results[target_cmd - 1].url
	send_message(url, channel_id)
}

bot.on('message', (user, user_id, channel_id, msg, evnt) => {
	if (valid_cmd_prefix(msg)) {
		switch (get_cmd_prefix(msg)) {
			case INIT_CMD_PREFIX:
				handle_init_cmd(msg, channel_id);
				break;
			case RESPONSE_CMD_PREFIX:
				handle_response_cmd(msg, channel_id);
				break;
		}
	}
});

bot.on('ready', (e) => {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' -(' + bot.id + ')');
});
