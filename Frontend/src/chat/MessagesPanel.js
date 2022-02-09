import React from 'react';
import { Message } from './Message';

export class MessagesPanel extends React.Component {
    state = { 
        input_value: '',
        search_value: '',
        is_search: false
    }

    send = () => {
        if (this.state.input_value && this.state.input_value !== '') {
            this.props.onSendMessage(this.props.channel.id, this.state.input_value);
            this.setState({ input_value: '' });
        }
    }

    handleInput = e => {
        this.setState({ input_value: e.target.value });
    }

    handleSearchInput = e => {
        this.setState({ search_value: e.target.value });
    }

    search = e => {
        this.setState({is_search: true});
    }

    clearSearch = e => {
        this.setState({is_search: false});
        this.setState({ search_value: '' });
    }

    render() {
        let list = <div className="no-content-message">There is no messages to show</div>;
        if (this.props.channel && this.props.channel.messages) {
            let username = this.props.username;

            if (this.state.is_search) {
                list = this.props.channel.messages.filter(m => m.text.indexOf(this.state.search_value) !== -1).map(m => 
                    <Message channel_id={m.channel_id} key={m.id} id={m.id} senderName={m.senderName} text={m.text} isEditable={username === m.senderName}
                        onDeleteMessage={this.props.onDeleteMessage}
                        onEditMessage={this.props.onEditMessage} />
                );
            } else {
                list = this.props.channel.messages.map(m => 
                    <Message channel_id={m.channel_id} key={m.id} id={m.id} senderName={m.senderName} text={m.text} isEditable={username === m.senderName}
                        onDeleteMessage={this.props.onDeleteMessage}
                        onEditMessage={this.props.onEditMessage} />
                );
            }
        }
        return (
            <div className='messages-panel'>
                <div className='message-search'>
                    Search: <input type="text" onChange={this.handleSearchInput} value={this.state.search_value} />
                    <button onClick={this.search}>Search Messages</button>
                    <button onClick={this.clearSearch}>Clear</button>
                </div>
                <div className="messages-list">{list}</div>
                {this.props.channel &&
                    <div className="messages-input">
                        <input type="text" onChange={this.handleInput} value={this.state.input_value} />
                        <button onClick={this.send}>Send</button>
                    </div>
                }
            </div>);
    }

}