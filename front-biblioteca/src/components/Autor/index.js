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

class FormAutor extends Component {

    state = { 
        model: { 
            id: 0, 
            nome: '', 
            sexo: '',
            ano_nasc: 0, 
            nacionalidade: '' 
        } 
    };

    setValues = (e, field) => {
        const { model } = this.state;
        model[field] = e.target.value;
        this.setState({ model });
    }

    create = () => {
        this.setState({ model: {  id: 0, nome: '',sexo: '',ano_nasc: 0,nacionalidade: ''  } })
        this.props.autorCreate(this.state.model);
    }

    componentWillMount() {
        PubSub.subscribe('edit-autor', (topic, autor) => {
            this.setState({ model: autor });
        });
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="nome">Autor:</Label>
                    <Input id="nome" type="text" value={this.state.model.nome} placeholder="Nome do autor"
                    onChange={e => this.setValues(e, 'nome') } />
                </FormGroup>
                <FormGroup>
                    <div className="form-row">
                        <div className="col-md-4">
                            <Label for="ano">Ano:</Label>
                            <Input id="nome" type="text"  value={this.state.model.ano_nasc} placeholder="1996" 
                            onChange={e => this.setValues(e, 'ano_nasc') } />
                        </div>
                        <div className="col-md-4">
                            <Label for="nacionalidade">Nacionalidade:</Label>
                            <Input id="nacionalidade" type="text" value={this.state.model.nacionalidade} placeholder="Ex.: Brasileiro" 
                            onChange={e => this.setValues(e, 'nacionalidade') } />
                        </div>
                        <div className="col-md-4">
                            <Label for="sexo">Sexo:</Label>
                            <Input id="sexo" size='1' type="text" value={this.state.model.sexo} placeholder="M = Masculino, F = Feminino" 
                            onChange={e => this.setValues(e, 'sexo') } />
                        </div>
                    </div>
                </FormGroup>
                <Button color="primary" block onClick={this.create}> Gravar </Button>
            </Form>
        );
    }
}

class ListAutores extends Component {

    delete = (id) => {
        this.props.deleteAutor(id);
    }

    onEdit = (autor) => {
        PubSub.publish('edit-autor', autor);
    }

    render() {
        const { autores } = this.props;
        return (
            <Table className="table-bordered text-center">
                <thead className="thead-dark">
                    <tr>
                        <th>Autor</th>
                        <th>Nascimento</th>
                        <th>Nacionalidade.</th>
                        <th>Sexo</th>
                        <th>Opções</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        autores.map(autors => (
                            <tr key={autors.id}>
                                <td>{autors.nome}</td>
                                <td>{autors.ano_nasc}</td>
                                <td>{autors.nacionalidade}</td>
                                <td>{autors.sexo}</td>
                                <td>
                                    <Button color="info" size="sm" onClick={e => this.onEdit(autors)}>Editar</Button>
                                    <Button color="danger" size="sm" onClick={e => this.delete(autors.id)}>Deletar</Button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        );
    }   
}

export default class AutoresBox extends Component {

    Url = 'http://127.0.0.1:8000/api/autor';

    state = {
        autores: [],
        message: {
            text: '',
            alert: ''
        }
    }

    componentDidMount() {
        fetch(this.Url)
            .then(response => response.json())
            .then(autores => this.setState({ autores }))
            .catch(e => console.log(e));
    }

    save = (autor) => {
        let data = {
            id: parseInt(autor.id),
            nome: autor.nome,
            ano_nasc: parseInt(autor.ano_nasc),
            nacionalidade: autor.nacionalidade,
            sexo: autor.sexo
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
            // CREATE NEW AUTOR
            fetch(this.Url, requestInfo)
            .then(response => response.json())
            .then(newAutor => {
                let { autores } = this.state;
                autores.push(newAutor.data);
                this.setState({ autores, message: { text: 'Novo autor adicionado com sucesso!', alert: 'success' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        } else {
            // EDIT AUTOR
            fetch(`${this.Url}/${data.id}`, requestInfo)
            .then(response => response.json())
            .then(updatedAutor => {
                let { autores } = this.state;
                let position = autores.findIndex(autor => autor.id === data.id);
                autores[position] = updatedAutor;
                window.location.reload();
                this.setState({ autores, message: { text: 'Autor atualizado com sucesso!', alert: 'info' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        }
    }

    delete = (id) => {
        fetch(`${this.Url}/${id}`, {method: 'DELETE'})
            .then(response => response.json())
            .then(rows => {
                const autores = this.state.autores.filter(autor => autor.id !== id);
                this.setState({ autores,  message: { text: 'Autor deletado com sucesso.', alert: 'danger' } });
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
                        <h2 className="font-weight-bold text-center"> Cadastro de Autores </h2>
                        <FormAutor autorCreate={this.save} />
                    </div>
                    <div className="col-md-6 my-3">
                        <h2 className="font-weight-bold text-center"> Lista de Autores </h2>
                        <ListAutores autores={this.state.autores}  deleteAutor={this.delete} />
                    </div>
                </div>
            </div>
        );
    }
}