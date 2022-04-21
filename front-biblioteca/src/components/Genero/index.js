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

class FormGenero extends Component {

    state = { 
        model: { 
            id: 0, 
            descricao: ''
        } 
    };

    setValues = (e, field) => {
        const { model } = this.state;
        model[field] = e.target.value;
        this.setState({ model });
    }

    create = () => {
        this.setState({ model: {  id: 0, descricao: '' } })
        this.props.generoCreate(this.state.model);
    }

    componentWillMount() {
        PubSub.subscribe('edit-genero', (topic, genero) => {
            this.setState({ model: genero });
        });
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="descricao">Gênero Literário:</Label>
                    <Input id="descricao" type="text" value={this.state.model.descricao} placeholder="Romance"
                    onChange={e => this.setValues(e, 'descricao') } />
                </FormGroup>
                <Button color="primary" block onClick={this.create}> Gravar </Button>
            </Form>
        );
    }
}

class ListGeneros extends Component {

    delete = (id) => {
        this.props.deleteGenero(id);
    }

    onEdit = (genero) => {
        PubSub.publish('edit-genero', genero);
    }

    render() {
        const { generos } = this.props;
        return (
            <Table className="table-bordered text-center">
                <thead className="thead-dark">
                    <tr>
                        <th>Descricao</th>
                        <th>Opções</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        generos.map(generos => (
                            <tr key={generos.id}>
                                <td>{generos.descricao}</td>
                                <td>
                                    <Button color="info" size="sm" onClick={e => this.onEdit(generos)}>Editar</Button>
                                    <Button color="danger" size="sm" onClick={e => this.delete(generos.id)}>Deletar</Button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        );
    }   
}

export default class GenerosBox extends Component {

    Url = 'http://127.0.0.1:8000/api/genero';

    state = {
        generos: [],
        message: {
            text: '',
            alert: ''
        }
    }

    componentDidMount() {
        fetch(this.Url)
            .then(response => response.json())
            .then(generos => this.setState({ generos }))
            .catch(e => console.log(e));
    }

    save = (genero) => {
        let data = {
            id: parseInt(genero.id),
            descricao: genero.descricao
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
            // CREATE NEW GENERO
            fetch(this.Url, requestInfo)
            .then(response => response.json())
            .then(newGenero => {
                let { generos } = this.state;
                generos.push(newGenero.data);
                this.setState({ generos, message: { text: 'Novo gênero literário adicionado com sucesso!', alert: 'success' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        } else {
            // EDIT GENERO
            fetch(`${this.Url}/${data.id}`, requestInfo)
            .then(response => response.json())
            .then(updatedGenero => {
                let { generos } = this.state;
                let position = generos.findIndex(genero => genero.id === data.id);
                generos[position] = updatedGenero;
                window.location.reload();
                this.setState({ generos, message: { text: 'Genero atualizado com sucesso!', alert: 'info' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        }
    }

    delete = (id) => {
        fetch(`${this.Url}/${id}`, {method: 'DELETE'})
            .then(response => response.json())
            .then(rows => {
                const generos = this.state.generos.filter(genero => genero.id !== id);
                this.setState({ generos,  message: { text: 'Genero deletado com sucesso.', alert: 'danger' } });
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
                        <h2 className="font-weight-bold text-center"> Gêneros Literários </h2>
                        <FormGenero generoCreate={this.save} />
                    </div>
                    <div className="col-md-6 my-3">
                        <h2 className="font-weight-bold text-center"> Lista de Gêneros </h2>
                        <ListGeneros generos={this.state.generos}  deleteGenero={this.delete} />
                    </div>
                </div>
            </div>
        );
    }
}