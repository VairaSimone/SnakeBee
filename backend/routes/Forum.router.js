import express from 'express';
import { authenticateJWT } from '../middlewares/Auth.js';
import * as postController from '../controllers/ForumPost_controller.js';
import * as threadController from '../controllers/ForumThread_controller.js';
import * as CategoryController from '../controllers/ForumCategory_controller.js';
import { isAdmin, isOwnerOrAdmin } from '../middlewares/Authorization.js';
import ForumPost from '../models/ForumPost.js';
import ForumThread from '../models/ForumThread.js';

const forum = express.Router();

// Categories (only admin can create, edit or delete)
forum.get('/categories', authenticateJWT, CategoryController.getCategories);
forum.get('/categories/:categoryId', authenticateJWT, CategoryController.getCategory);
forum.post('/categories', authenticateJWT, isAdmin, CategoryController.createCategory);
forum.put('/categories/:categoryId', authenticateJWT, isAdmin, CategoryController.updateCategory);
forum.delete('/categories/:categoryId', authenticateJWT, isAdmin, CategoryController.deleteCategory);

// Thread (create and view is open to everyone, edit/delete only owners or admins)
forum.get('/threads/:threadId', authenticateJWT, threadController.getThread);
forum.get('/categories/:categoryId/threads', authenticateJWT, threadController.getCategoryThreadsPaginated);
forum.post('/categories/:categoryId/threads', authenticateJWT, threadController.createThread);
forum.put('/threads/:threadId', authenticateJWT, isOwnerOrAdmin(ForumThread, 'threadId'), threadController.updateThread);
forum.delete('/threads/:threadId', authenticateJWT, isOwnerOrAdmin(ForumThread, 'threadId'), threadController.deleteThread);

// Post (create and view is open to everyone, edit/delete only owners or admins)
forum.get('/posts/:postId', authenticateJWT, postController.getPost);
forum.get('/threads/:threadId/posts', authenticateJWT, postController.getThreadPosts);
forum.post('/threads/:threadId/posts', authenticateJWT, postController.createPost);
forum.put('/posts/:postId', authenticateJWT, isOwnerOrAdmin(ForumPost, 'postId'), postController.updatePost);
forum.delete('/posts/:postId', authenticateJWT, isOwnerOrAdmin(ForumPost, 'postId'), postController.deletePost);

// Likes e Reports (solo utenti autenticati possono segnalare o mettere like)
forum.put('/posts/:postId/like', authenticateJWT, postController.likePost);
forum.post('/posts/:postId/report', authenticateJWT, postController.reportPost);

// Subscriptions
forum.post('/threads/:threadId/subscribe', authenticateJWT, threadController.subscribeToThread);
forum.post('/threads/:threadId/unsubscribe', authenticateJWT, threadController.unsubscribeFromThread);

export default forum;
