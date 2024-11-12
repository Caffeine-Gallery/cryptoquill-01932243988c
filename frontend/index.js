import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showNewPostForm);
    document.getElementById('submitPost').addEventListener('click', handleSubmitPost);
    document.getElementById('cancelPost').addEventListener('click', hideNewPostForm);

    // Load initial posts
    await loadPosts();
});

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
    resetForm();
}

function resetForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('authorName').value = '';
    quill.setContents([]);
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

async function handleSubmitPost() {
    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('authorName').value;
    const content = quill.root.innerHTML;

    if (!title || !author || !content) {
        alert('Please fill in all fields');
        return;
    }

    showLoading();
    try {
        await backend.createPost(title, content, author);
        hideNewPostForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    }
    hideLoading();
}

async function loadPosts() {
    showLoading();
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Failed to load posts. Please refresh the page.');
    }
    hideLoading();
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';

    const date = new Date(Number(post.timestamp / 1000000n));
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    article.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            <span class="author">By ${post.author}</span>
            <span class="date">${formattedDate}</span>
        </div>
        <div class="post-content">${post.body}</div>
    `;

    return article;
}
