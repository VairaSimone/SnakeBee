import ForumThread from '../models/ForumThread.js';

export const getThread = async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await ForumThread.findById(threadId).populate('user');
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving thread' });
  }
};

export const getCategoryThreadsPaginated = async (req, res) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const threads = await ForumThread.find({ category: categoryId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalThreads = await ForumThread.countDocuments({ category: categoryId });
    res.json({ threads, totalPages: Math.ceil(totalThreads / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching threads' });
  }
};


export const createThread = async (req, res) => {
  const { categoryId } = req.params;
  const { title, content, user, imageUrl } = req.body;

  try {

    if (!title || !content || !user) {
      return res.status(400).json({ message: 'Title, content and user are mandatory' });
    }

    const newThread = new ForumThread({
      title,
      content,
      user,
      category: categoryId,
      imageUrl: imageUrl || null, 
      createdAt: new Date(),
    });

    const savedThread = await newThread.save();
    res.status(201).json(savedThread);
  } catch (error) {

    res.status(500).json({ message: 'Error creating thread' });
  }
};

export const updateThread = async (req, res) => {
  const { threadId } = req.params;
  const { title, content } = req.body;

  try {
    const updatedThread = await ForumThread.findByIdAndUpdate(threadId, { title, content }, { new: true });
    if (!updatedThread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json(updatedThread);
  } catch (error) {
    res.status(500).json({ message: 'Error updating thread' });
  }
};

export const deleteThread = async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await ForumThread.findByIdAndDelete(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json({ message: 'Thread deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting thread' });
  }
};


export const subscribeToThread = async (req, res) => {
  const { threadId } = req.params;
  const userId = req.user.id;

  try {
    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (!thread.subscriptions.includes(userId)) {
      thread.subscriptions.push(userId);
      await thread.save();
    }

    res.json({ message: 'Subscribed to thread', subscriptions: thread.subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing to thread' });
  }
};
export const searchThreads = async (req, res) => {
  const { query } = req.query;  

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Search query missing or empty' });
  }

  try {
    const threads = await ForumThread.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },  
        { content: { $regex: query, $options: 'i' } }  
      ]
    }).populate('user');

    if (threads.length === 0) {
      return res.status(404).json({ message: 'No threads found' });
    }

    res.json(threads); 
  } catch (error) {
    res.status(500).json({ message: 'Error while searching for threads' });
  }
};


export const unsubscribeFromThread = async (req, res) => {
  const { threadId } = req.params;
  const userId = req.user.id;

  try {
    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    thread.subscriptions = thread.subscriptions.filter(sub => sub.toString() !== userId);
    await thread.save();

    res.json({ message: 'Unsubscribed from thread', subscriptions: thread.subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Error unsubscribing from thread' });
  }
};

