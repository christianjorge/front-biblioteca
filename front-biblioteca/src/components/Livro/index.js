import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import { 
    Table, 
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Alert
} from 'reactstrap';


class SelectEditora extends Component{
    UrlEditora = 'http://127.0.0.1:8000/api/editora';
    state = {
        editoras: []
    }

    componentDidMount() {
        fetch(this.UrlEditora)
            .then(response => response.json())
            .then(editoras => this.setState({ editoras }))
            .catch(e => console.log(e));
    }

    handleChange(e){
        e.preventDefault();
        const valor = e.target.value;
        this.props.funcao(valor, 'id_editora');
    }

    render(){
        return(
            <select className="form-control" onChange={this.handleChange.bind(this)}>
                <option value=''>Selecione</option>
                {
                    this.state.editoras.map(
                        row=>
                        <option value={row.id}>{row.nome_editora}</option>
                    )
                }
            </select>
        );
    }

}

class SelectAutor extends Component{
    UrlAutor = 'http://127.0.0.1:8000/api/autor';
    state = {
        autores: []
    }

    componentDidMount() {
        fetch(this.UrlAutor)
            .then(response => response.json())
            .then(autores => this.setState({ autores }))
            .catch(e => console.log(e));
    }

    handleChange(e){
        e.preventDefault();
        const valor = e.target.value;
        this.props.funcao(valor, 'id_autor');
    }

    render(){
        return(
            <select className="form-control" required onChange={this.handleChange.bind(this)}>
                <option value=''>Selecione</option>
                {
                    this.state.autores.map(
                        row=>
                        <option value={row.id}>{row.nome}</option>
                    )
                }
            </select>
        );
    }

}

class SelectGenero extends Component{
    UrlGen = 'http://127.0.0.1:8000/api/genero';
    state = {
        generos: []
    }

    componentDidMount() {
        fetch(this.UrlGen)
            .then(response => response.json())
            .then(generos => this.setState({ generos }))
            .catch(e => console.log(e));
    }

    handleChange(e){
        e.preventDefault();
        const valor = e.target.value;
        this.props.funcao(valor, 'id_genero');
    }

    render(){
        return(
            <select className="form-control" onChange={this.handleChange.bind(this)}>
                <option value=''>Selecione</option>
                {
                    this.state.generos.map(
                        row=>
                        <option value={row.id}>{row.descricao}</option>
                    )
                }
            </select>
        );
    }

}

class FormLivro extends Component {    
    state = { 
        model: { 
            id: 0, 
            ano: 0, 
            titulo:'',
            id_editora: 0, 
            id_autor: 0, 
            id_genero: 0
        } 
    };

    setValues = (e, field) => {
        const { model } = this.state;
        model[field] = e.target.value;
        this.setState({ model });
    }

    setValuesSelect = (val, field) => {
        const { model } = this.state;
        model[field] = parseInt(val);
        this.setState({ model });
        console.log(this.state);
    }

    create = () => {
        this.setState({ model: {  id: 0, 
            ano: 0, 
            titulo:'',
            id_editora: 0, 
            id_autor: 0, 
            id_genero: 0  } })
        this.props.livroCreate(this.state.model);
    }

    componentWillMount() {
        PubSub.subscribe('edit-livro', (topic, livro) => {
            this.setState({ model: livro });
        });
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <div className="form-row">
                        <div className="col-md-8">
                            <Label for="titulo">livro:</Label>
                            <Input id="titulo" type="text" value={this.state.model.titulo} placeholder="Nome do livro"
                            onChange={e => this.setValues(e, 'titulo') } />
                        </div>
                        <div className="col-md-4">
                            <Label for="ano">Ano:</Label>
                            <Input id="ano" type="text"  value={this.state.model.ano}
                            onChange={e => this.setValues(e, 'ano') } />
                        </div>
                    </div>
                </FormGroup>
                <FormGroup>
                    <div className="form-row">
                        <div className="col-md-4">
                            <Label for="id_autor">Autor:</Label>
                            <SelectAutor funcao={this.setValuesSelect.bind(this)}/>
                        </div>
                        <div className="col-md-4">
                            <Label for="id_editora">Editora:</Label>
                            <SelectEditora funcao={this.setValuesSelect.bind(this)}/>
                        </div>
                        <div className="col-md-4">
                            <Label for="id_genero">Genero:</Label>
                            <SelectGenero funcao={this.setValuesSelect.bind(this)}/>
                        </div>
                    </div>
                </FormGroup>
                <Button color="primary" block onClick={this.create}> Gravar </Button>
            </Form>
        );
    }
}

class ListLivros extends Component {

    delete = (id) => {
        this.props.deleteLivro(id);
    }

    onEdit = (livro) => {
        PubSub.publish('edit-livro', livro);
    }

    render() {
        const { livros } = this.props;
        return (
            <Table className="table-bordered text-center">
                <thead className="thead-dark">
                    <tr>
                        <th>Titulo</th>
                        <th>Ano</th>
                        <th>Genero</th>
                        <th>Autor</th>
                        <th>Editora</th>
                        <th>Opções</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        livros.map(livros => (
                            <tr key={livros.id}>
                                <td>{livros.titulo}</td>
                                <td>{livros.ano}</td>
                                <td>{livros.genero}</td>
                                <td>{livros.autor}</td>
                                <td>{livros.editora}</td>
                                <td>
                                    <Button color="info" size="sm" onClick={e => this.onEdit(livros)}>Editar</Button>
                                    <Button color="danger" size="sm" onClick={e => this.delete(livros.id)}>Deletar</Button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        );
    }   
}

export default class LivrosBox extends Component {

    Url = 'http://127.0.0.1:8000/api/livro';

    state = {
        livros: [],
        message: {
            text: '',
            alert: ''
        }
    }

    componentDidMount() {
        fetch(this.Url)
            .then(response => response.json())
            .then(livros => this.setState({ livros }))
            .catch(e => console.log(e));
    }

    save = (livro) => {
        let data = {
            id: parseInt(livro.id),
            titulo: livro.titulo,
            ano: parseInt(livro.ano),
            id_autor: parseInt(livro.id_autor),
            id_editora: parseInt(livro.id_editora),
            id_genero: parseInt(livro.id_genero)
        };
        console.log(data);

        const requestInfo = {
            method: data.id !== 0? 'PUT': 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-type': 'application/json'
            })
        };

        if(data.id === 0) {
            // CREATE NEW livro
            fetch(this.Url, requestInfo)
            .then(response => response.json())
            .then(newlivro => {
                let { livros } = this.state;
                livros.push(newlivro.data);
                this.setState({ livros, message: { text: 'Novo livro adicionado com sucesso!', alert: 'success' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        } else {
            // EDIT livro
            fetch(`${this.Url}/${data.id}`, requestInfo)
            .then(response => response.json())
            .then(updatedlivro => {
                let { livros } = this.state;
                let position = livros.findIndex(livro => livro.id === data.id);
                livros[position] = updatedlivro;
                window.location.reload();
                this.setState({ livros, message: { text: 'livro atualizado com sucesso!', alert: 'info' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        }
    }

    delete = (id) => {
        fetch(`${this.Url}/${id}`, {method: 'DELETE'})
            .then(response => response.json())
            .then(rows => {
                const livros = this.state.livros.filter(livro => livro.id !== id);
                this.setState({ livros,  message: { text: 'livro deletado com sucesso.', alert: 'danger' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e));
    }

    timerMessage = (duration) => {
        setTimeout(() => {
            this.setState({ message: { text: '', alert: ''} });
        }, duration);
    }

    render() {
        return (
            <div>
                {
                    this.state.message.text !== ''? (
                        <Alert color={this.state.message.alert} className="text-center"> {this.state.message.text} </Alert>
                    ) : ''
                }

                <div className="row">
    
                    <div className="col-md-6 my-3">
                        <h2 className="font-weight-bold text-center"> Cadastro de livros </h2>
                        <FormLivro livroCreate={this.save} />
                    </div>
                    <div className="col-md-6 my-3">
                        <h2 className="font-weight-bold text-center"> Lista de livros </h2>
                        <ListLivros livros={this.state.livros}  deleteLivro={this.delete} />
                    </div>
                </div>
            </div>
        );
    }
}