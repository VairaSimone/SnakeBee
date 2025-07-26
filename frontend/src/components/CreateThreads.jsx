import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { selectUser } from '../features/userSlice';

const CreateThread = ({ categoryId, onThreadCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const user = useSelector(selectUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title || !content) {
      setError('Titolo e contenuto sono obbligatori');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post(`/forum/categories/${categoryId}/threads`, {
        title,
        content,
        user: user._id,
        imageUrl: imageUrl || null,
      });

      setTitle('');
      setContent('');
      setImageUrl('');
      setSuccess('Thread creato con successo!');
      onThreadCreated(data); 
    } catch (err) {
      setError('Errore durante la creazione del thread');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {user ? (
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form.Group controlId="title">
            <Form.Label>Titolo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Inserisci il titolo del thread"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="content" className="mt-3">
            <Form.Label>Contenuto</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Inserisci il contenuto del thread"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="imageUrl" className="mt-3">
            <Form.Label>URL dell'immagine</Form.Label>
            <Form.Control
              type="text"
              placeholder="Inserisci l'URL dell'immagine"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" className="mt-3" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Crea Thread'}
          </Button>
        </Form>
      ) : (
        <Alert variant="warning">Devi essere autenticato per creare un thread</Alert>
      )}
    </>
  );
};

export default CreateThread;
