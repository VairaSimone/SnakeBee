import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Spinner, Alert, Card, Button, Form, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';  

const ForumCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  
  const user = useSelector(selectUser); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/forum/categories');
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento delle categorie');
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleNewCategory = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/forum/categories', newCategory);
      setCategories([data, ...categories]);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      console.error('Errore nella creazione della categoria', err);
    }
  };

  return (
    <Container className="mt-4">
      <Link className="btn btn-outline-secondary" to="/home">Torna indietro</Link>
      <h2 className="forum-title">Forum - Categorie</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="row">
          {categories.map((category) => (
            <div key={category._id} className="col-md-4 mb-4">
              <Card className="forum-card">
                <Card.Body className="forum-card-body">
                  <Card.Title className="forum-card-title">{category.name}</Card.Title>
                  <Card.Text>{category.description}</Card.Text>
                  <Button as={Link} to={`/forum/categories/${category._id}`} className="forum-btn">
                    Visualizza Thread
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {user && user.role === 'admin' && (
        <div className="form-section mt-5">
          <h3>Crea una nuova categoria</h3>
          <Form onSubmit={handleNewCategory}>
            <Form.Group controlId="categoryName">
              <Form.Label>Nome della categoria</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nome della categoria"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="categoryDescription" className="mt-3">
              <Form.Label>Descrizione</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descrizione"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                required
              />
            </Form.Group>
            <Button className="forum-btn-create mt-3" type="submit">
              Crea Categoria
            </Button>
          </Form>
        </div>
      )}
    </Container>
  );
};

export default ForumCategories;
