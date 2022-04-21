import React, { Component } from 'react';
import AutoresBox from './components/Autor';
import GenerosBox from './components/Genero';
import EditorasBox from './components/Editora';
import LivrosBox from './components/Livro';
import Header from './components/Header';



class App extends Component {
  render() {
    return (
      <div className="container">
        <Header title="Biblioteca Front" />
        <br />
        <LivrosBox />
        <br />
        <AutoresBox />
        <br />
        <GenerosBox />
        <br />
        <EditorasBox />
      </div>
    );
  }
}

export default App;
