import React from 'react';


export class Message extends React.Component {
    state = {
        isEdit: false,
        input_value: ''
    }

    handleInput = e => {
        this.setState({ input_value: e.target.value });
    }

    handleDeleteMessage = () => {
        this.props.onDeleteMessage(this.props.channel_id, this.props.text, this.props.id);
    }

    handleEditMessage = () => {
        this.setState({isEdit: true});
    }

    handleEditOKMessage = () => {
        this.props.onEditMessage(this.props.channel_id, this.state.input_value, this.props.id);
        this.setState({isEdit: false});
    }

    handleEditCancelMessage = () => {
        this.setState({isEdit: false});
    }

    render() {
        return (
            <div className='message-item'>
                <div><b>{this.props.senderName}</b></div>
                <span>{this.props.text}</span>
                {this.props.isEditable ?
                <div style={{'float': 'right'}}>
                    <button onClick={this.handleEditMessage}>edit</button>
                    <button onClick={this.handleDeleteMessage}>delete</button>
                </div>
                :''}
                {this.state.isEdit?
                <div>
                    <input type="text" onChange={this.handleInput} value={this.state.input_value} />
                    <button onClick={this.handleEditOKMessage}>OK</button>
                    <button onClick={this.handleEditCancelMessage}>Cancel</button>
                </div>:''}
            </div>
        )
    }
}