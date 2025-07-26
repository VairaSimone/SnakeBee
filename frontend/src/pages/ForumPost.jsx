import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner, Alert, Form, Button, Container } from 'react-bootstrap';
import { selectUser } from '../features/userSlice';
import api from '../services/api';

//post
const ForumPost = () => {
  const { threadId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', image: '' });
  const [categoryId, setCategoryId] = useState(null);
  const [thread, setThread] = useState(null);

  const user = useSelector(selectUser);

  const fetchCreatorName = async (creatorId) => {
    try {
      const { data } = await api.get(`/user/${creatorId}`);
      return data.name;
    } catch (err) {
      console.error('Errore nel recupero del nome del creatore', err);
      return 'Sconosciuto';
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await api.put(`/forum/posts/${postId}/like`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: data.likes } : post
        )
      );
    } catch (error) {
      console.error('Errore nel mettere like al post', error);
    }
  };

  useEffect(() => {
    const fetchPostsAndThreadInfo = async () => {
      try {
        const { data: postData } = await api.get(`/forum/threads/${threadId}/posts`);

        const postsWithCreatorNames = await Promise.all(
          postData.posts.map(async (post) => {
            const creatorName = await fetchCreatorName(post.user);
            return { ...post, creatorName };
          })
        );

        setPosts(postData.posts);

        const { data: threadData } = await api.get(`/forum/threads/${threadId}`);
        setCategoryId(threadData.category);
        setThread(threadData);

        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento dei post o delle informazioni del thread');
        setLoading(false);
      }
    };
    fetchPostsAndThreadInfo();
  }, [threadId]);

  const handleNewPost = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      setError('Errore: Utente non trovato');
      return;
    }

    if (!categoryId) {
      setError('Errore: ID della categoria non trovato');
      return;
    }

    try {
      const { data } = await api.post(`/forum/threads/${threadId}/posts`, {
        title: newPost.title,
        content: newPost.content,
        user: user._id,
        category: categoryId,
        image: newPost.image,
      });

      setPosts([data, ...posts]);
      setNewPost({ title: '', content: '', image: '' });
    } catch (err) {
      setError('Errore nella creazione del post');
    }
  };

  return (
    <Container className="mt-4">
      <Link className="btn btn-outline-secondary" to="/forum">Torna indietro</Link>
      <h2 className="forum-title">Forum - Post</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {thread && <h2 className="forum-title">{thread.title}</h2>}

          <ul className="list-group mt-3">
            {posts.map((post) => (
              <li key={post._id} className="list-group-item">
                <h4>{post.title}</h4>
                <p>{post.content}</p>
                {post.image && (
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: 'auto' }} />
                )}
                <p>Creato da: {post.creatorName}</p>
                <p>{new Date(post.createdAt).toLocaleString()}</p>
                <div className="d-flex justify-content-start align-items-center">
                  <Button variant="outline-primary" onClick={() => handleLike(post._id)}>
                    Like {post.likes}
                  </Button>
                </div>

              </li>
            ))}
          </ul>

          {user && (
            <div className="form-section mt-5">
              <h3>Crea un nuovo post</h3>
              <Form onSubmit={handleNewPost}>
                <Form.Group controlId="postTitle">
                  <Form.Label>Titolo del post</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Titolo"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="input-custom"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="postContent" className="mt-3">
                  <Form.Label>Contenuto</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Contenuto"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="input-custom"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="postImage" className="mt-3">
                  <Form.Label>Link Immagine</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="URL dell'immagine"
                    value={newPost.image}
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                    className="input-custom"
                  />
                </Form.Group>

                <Button className="forum-btn-create mt-3" type="submit">
                  Crea Post
                </Button>
              </Form>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ForumPost;
