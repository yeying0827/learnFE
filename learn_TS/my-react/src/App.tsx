import React from 'react';
import logo from './logo.svg';
import { Logo } from './components/Logo';
import TodoInput, {HOCInput} from "./components/TodoInput";
import './App.css';

function App() {
  const handleAdd = (value: string) => {
    console.log(value);
  }

  return (
    <div className="App">
      <header className="App-header">
        {/*<img src={logo} className={className} alt={alt} /> 替换为logo组件*/}
        <Logo className={"App-logo"} logo={logo} alt={"logo"}/>
        <TodoInput handleSubmit={handleAdd}>

        </TodoInput>
        <HOCInput handleSubmit={handleAdd}>

        </HOCInput>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
