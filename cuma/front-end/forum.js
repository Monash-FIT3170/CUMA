document.getElementById('post-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from refreshing the page
    
    // Get the content of the post
    const postContent = document.getElementById('post-content').value;
    
    if (postContent) {
      // Create a new list item (li) for the post
      const postElement = document.createElement('li');
      postElement.textContent = postContent;
  
      // Add the new post to the posts list
      document.getElementById('posts-list').appendChild(postElement);
  
      // Clear the textarea after submitting
      document.getElementById('post-content').value = '';
    }
  });
  