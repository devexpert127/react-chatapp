import React from 'react';
import { ChannelList } from './ChannelList';
import './chat.scss';
import { MessagesPanel } from './MessagesPanel';
import socketClient from "socket.io-client";
const SERVER = "http://127.0.0.1:8080";

export default class Chat extends React.Component {

    state = {
        channels: null,
        socket: null,
        channel: null,
        username: 'bot'
    }
    socket;

    
    componentDidMount() {
        this.username = this.props.username;
        this.loadChannels();
        this.configureSocket();
    }

    configureSocket = () => {
        var socket = socketClient(SERVER);
        socket.on('connection', () => {
            if (this.state.channel) {
                this.handleChannelSelect(this.state.channel.id);
            }
        });
        socket.on('channel', channel => {
            let channels = this.state.channels;
            channels.forEach(c => {
                if (c.id === channel.id) {
                    c.participants = channel.participants;
                    c.messages = channel.messages;
                }
            });
            this.setState({ channels });
        });
        socket.on('message', message => {
            let channels = this.state.channels
            channels.forEach(c => {
                if (c.id === message.channel_id) {
                    if (!c.messages) {
                        c.messages = [message];
                    } else {
                        c.messages.push(message);
                    }
                }
            });
            this.setState({ channels });
        });
        socket.on('delete', message => {
            let channels = this.state.channels
            channels.forEach(c => {
                if (c.id === message.channel_id) {
                    if (c.messages) {
                        c.messages = c.messages.filter(function(original){
                            return original.id !== message.id;
                        });
                    }
                }
            });
            this.setState({ channels });
        });
        socket.on('edit', message => {
            let channels = this.state.channels
            channels.forEach(c => {
                if (c.id === message.channel_id) {
                    if (c.messages) {
                        c.messages = c.messages.map(function(original){
                            if (original.id !== message.id)
                                return original;
                            else {
                                return message;
                            }
                        });
                    }
                }
            });
            this.setState({ channels });
        });
        this.socket = socket;
    }

    loadChannels = async () => {
        fetch('http://localhost:8080/getChannels').then(async response => {
            let data = await response.json();
            this.setState({ channels: data.channels });
        })
    }

    handleChannelSelect = id => {
        let channel = this.state.channels.find(c => {
            return c.id === id;
        });
        this.setState({ channel });
        this.socket.emit('channel-join', id, ack => {
        });
    }

    handleSendMessage = (channel_id, text) => {
        this.socket.emit('send-message', { channel_id, text, sender_id: this.socket.id, senderName: this.username, id: Date.now() });
    }

    handleDeleteMessage = (channel_id, text, msg_id) => {
        this.socket.emit('delete-message', { channel_id, text, sender_id: this.socket.id, senderName: this.username, id: msg_id });
    }

    handleEditMessage = (channel_id, text, msg_id) => {
        this.socket.emit('edit-message', { channel_id, text, sender_id: this.socket.id, senderName: this.username, id: msg_id });
    }

    render() {
        return (
            <div className='chat-app'>
                <ChannelList channels={this.state.channels} onSelectChannel={this.handleChannelSelect} />
                <MessagesPanel onSendMessage={this.handleSendMessage} onEditMessage={this.handleEditMessage} onDeleteMessage={this.handleDeleteMessage} channel={this.state.channel} username={this.props.username} />
            </div>
        );
    }
}