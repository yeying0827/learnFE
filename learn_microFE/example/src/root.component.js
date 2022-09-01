import React from 'react';

export default class RootComponent extends React.Component {
  constructor(props) {
    // console.log(props);
    super(props);
  }

  render() {
    return (<div className="root-div">
      页面导航栏，
      接收到的token为：{this.props.authToken}
    </div>)
  }
}