import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Spinner, Alert, Form, Button, Container, Card } from 'react-bootstrap';
import api from '../services/api';
import CreateThread from '../components/CreateThreads'; 

const ForumThreads = () => {
  const { categoryId } = useParams();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');


  const fetchCreatorName = async (creatorId) => {
    try {
      const { data } = await api.get(`/user/${creatorId}`);
      return data.name;
    } catch (err) {
      console.error('Errore nel recupero del nome del creatore', err);
      return 'Sconosciuto';
    }
  };

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const { data } = await api.get(`/forum/categories/${categoryId}/threads`);
        
  
        const threadsWithCreatorNames = await Promise.all(
          data.threads.map(async (thread) => {
            const creatorName = await fetchCreatorName(thread.user);
            return { ...thread, creatorName }; 
          })
        );
  
        setThreads(threadsWithCreatorNames); 
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento dei thread');
        setLoading(false);
      }
    };
  
    fetchThreads();
  }, [categoryId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setThreads([]);

    try {
      const { data } = await api.get(`/forum/threads/search?query=${searchQuery}`);
      if (data.length === 0) {
        setError('Nessun thread trovato per questa ricerca');
      } else {
        setThreads(data);
      }
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Nessun thread trovato per questa ricerca');
      } else {
        setError('Errore nella ricerca dei thread');
      }
      setLoading(false);
    }
  };

  const handleThreadCreated = (newThread) => {
    setThreads([newThread, ...threads]);
  };

  return (
    <Container className="mt-4">
      <Link className="btn btn-outline-secondary" to="/forum">Torna indietro</Link>
      <h2 className="forum-title">Forum - Thread</h2>

      <Form onSubmit={handleSearch} className="mb-4">
        <Form.Group controlId="searchQuery">
          <Form.Control
            type="text"
            placeholder="Cerca nei thread"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Group>
        <Button type="submit">Cerca</Button>
      </Form>

      {loading && <Spinner animation="border" />}
      
      {error && <Alert variant="warning">{error}</Alert>}

      <div className="row mt-3">
        {threads.map((thread) => (
          <div key={thread._id} className="col-md-4 mb-4">
            <Card className="forum-card">
              {thread.imageUrl && (
                <Card.Img variant="top" src={thread.imageUrl} alt={thread.title} />
              )}
              <Card.Body className="forum-card-body">
                <Card.Title className="forum-card-title">{thread.title}</Card.Title>
                <Card.Text>{thread.content.substring(0, 100)}...</Card.Text>
                <Card.Text><small>Creato da: {thread.creatorName} il {new Date(thread.createdAt).toLocaleString()}</small></Card.Text>
                <Button as={Link} to={`/forum/threads/${thread._id}`} className="forum-btn">
                  Visualizza Post
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <h3 className="mt-4">Crea un nuovo Thread</h3>
      <CreateThread categoryId={categoryId} onThreadCreated={handleThreadCreated} />
    </Container>
  );
};

export default ForumThreads;
