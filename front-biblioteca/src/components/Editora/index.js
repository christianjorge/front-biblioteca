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

class FormEditora extends Component {

    state = { 
        model: { 
            id: 0, 
            nome_editora: ''
        } 
    };

    setValues = (e, field) => {
        const { model } = this.state;
        model[field] = e.target.value;
        this.setState({ model });
    }

    create = () => {
        this.setState({ model: {  id: 0, nome_editora: ''  } })
        this.props.editoraCreate(this.state.model);
    }

    componentWillMount() {
        PubSub.subscribe('edit-editora', (topic, editora) => {
            this.setState({ model: editora });
        });
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="nome_editora">Editora:</Label>
                    <Input id="nome_editora" type="text" value={this.state.model.nome_editora} placeholder="Nome da editora"
                    onChange={e => this.setValues(e, 'nome_editora') } />
                </FormGroup>
                <Button color="primary" block onClick={this.create}> Gravar </Button>
            </Form>
        );
    }
}

class ListEditoras extends Component {

    delete = (id) => {
        this.props.deleteEditora(id);
    }

    onEdit = (editora) => {
        PubSub.publish('edit-editora', editora);
    }

    render() {
        const { editoras } = this.props;
        return (
            <Table className="table-bordered text-center">
                <thead className="thead-dark">
                    <tr>
                        <th>Editora</th>
                        <th>Opções</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        editoras.map(editoras => (
                            <tr key={editoras.id}>
                                <td>{editoras.nome_editora}</td>
                                <td>
                                    <Button color="info" size="sm" onClick={e => this.onEdit(editoras)}>Editar</Button>
                                    <Button color="danger" size="sm" onClick={e => this.delete(editoras.id)}>Deletar</Button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        );
    }   
}

export default class EditorasBox extends Component {

    Url = 'http://127.0.0.1:8000/api/editora';

    state = {
        editoras: [],
        message: {
            text: '',
            alert: ''
        }
    }

    componentDidMount() {
        fetch(this.Url)
            .then(response => response.json())
            .then(editoras => this.setState({ editoras }))
            .catch(e => console.log(e));
    }

    save = (editora) => {
        let data = {
            id: parseInt(editora.id),
            nome_editora: editora.nome_editora
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
            // CREATE NEW editora
            fetch(this.Url, requestInfo)
            .then(response => response.json())
            .then(newEditora => {
                let { editoras } = this.state;
                editoras.push(newEditora.data);
                this.setState({ editoras, message: { text: 'Nova editora adicionado com sucesso!', alert: 'success' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        } else {
            // EDIT editora
            fetch(`${this.Url}/${data.id}`, requestInfo)
            .then(response => response.json())
            .then(updatedEditora => {
                let { editoras } = this.state;
                let position = editoras.findIndex(editora => editora.id === data.id);
                editoras[position] = updatedEditora;
                window.location.reload();
                this.setState({ editoras, message: { text: 'Editora atualizado com sucesso!', alert: 'info' } });
                this.timerMessage(3000);
            })
            .catch(e => console.log(e)); 
        }
    }

    delete = (id) => {
        fetch(`${this.Url}/${id}`, {method: 'DELETE'})
            .then(response => response.json())
            .then(rows => {
                const editoras = this.state.editoras.filter(editora => editora.id !== id);
                this.setState({ editoras,  message: { text: 'editora deletado com sucesso.', alert: 'danger' } });
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
                        <h2 className="font-weight-bold text-center"> Cadastro de editoras </h2>
                        <FormEditora editoraCreate={this.save} />
                    </div>
                    <div className="col-md-6 my-3">
                        <h2 className="font-weight-bold text-center"> Lista de editoras </h2>
                        <ListEditoras editoras={this.state.editoras}  deleteEditora={this.delete} />
                    </div>
                </div>
            </div>
        );
    }
}