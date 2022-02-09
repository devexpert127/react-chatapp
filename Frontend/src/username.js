import React from 'react';
import Chat from './chat/Chat';

export class Username extends React.Component {
  state = { input_value: '', hasUsername: false }

  handleInput = e => {
    this.setState({ input_value: e.target.value });
  }

  gotoChat = e => {
    if (this.state.input_value && this.state.input_value !== '') {
      this.setState({hasUsername: true});
    }
  }

  render() {
    return (
        this.state.hasUsername ?
        <Chat username={this.state.input_value}/> :
        <div className="Username">
          <header className="App-header">
            Username: <input name='username' onChange={this.handleInput}/>
            <button onClick={this.gotoChat}>OK</button>
          </header>
      </div>
    );
  }
}

export default Username;
