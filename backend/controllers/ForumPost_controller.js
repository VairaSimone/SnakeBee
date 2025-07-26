import ForumPost from '../models/ForumPost.js';
import Notification from '../models/Notification.js';
import ForumThread from '../models/ForumThread.js'; 

export const getPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await ForumPost.findById(postId).populate('user');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving post' });
  }
};


export const getThreadPosts = async (req, res) => {
  const { threadId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const posts = await ForumPost.find({ thread: threadId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPosts = await ForumPost.countDocuments({ thread: threadId });
    res.json({ posts, totalPages: Math.ceil(totalPosts / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const createPost = async (req, res) => {
  const { threadId } = req.params;
  const { title, content, user, category, image } = req.body;

  try {
    if (!title || !content || !user || !category) {
      return res.status(400).json({ message: 'Title, content, user, and category are required' });
    }

    const newPost = new ForumPost({
      title,
      content,
      user,
      category,
      thread: threadId,
      image: image || null,
    });

    const savedPost = await newPost.save();

    const thread = await ForumThread.findById(threadId).populate('subscriptions');

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    for (const subscriber of thread.subscriptions) {
      const newNotification = new Notification({
        user: subscriber._id,
        type: 'new_post',
        message: `Nuovo post in thread: ${thread.title}`,
        date: new Date(),
        status: 'pending',
      });
      await newNotification.save();
    }

    res.status(201).json(savedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  try {
    const updatedPost = await ForumPost.findByIdAndUpdate(postId, { title, content }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post' });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await ForumPost.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.body.userId; 

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userHasLiked = post.likedBy.includes(userId);

    if (userHasLiked) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
    } else {
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();

    res.json({ message: userHasLiked ? 'Like removed' : 'Post liked', likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post' });
  }
};

export const reportPost = async (req, res) => {
  const { postId } = req.params;
  const { reason } = req.body;

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.reports.push({ reason, reportedAt: new Date() });
    await post.save();

    res.json({ message: 'Post reported', reports: post.reports });
  } catch (error) {
    res.status(500).json({ message: 'Error reporting post' });
  }
};
