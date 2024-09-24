document.addEventListener('DOMContentLoaded', () => {
    // Initialize dummy users in local storage
    initializeDummyUsers();

    // Fetch users from local storage
    fetchUsers();

    // Add event listeners for navigation tabs
    document.querySelectorAll('#navigation li').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Add event listener for search input
    document.getElementById('search-input').addEventListener('input', filterUserList);

    // Add event listeners for action buttons
    document.getElementById('approve-btn').addEventListener('click', () => {
        handleUserAction('approve');
    });
    document.getElementById('reject-btn').addEventListener('click', () => {
        handleUserAction('reject');
    });
    document.getElementById('delete-btn').addEventListener('click', () => {
        handleUserAction('delete');
    });

    // Add event listener for closing the modal
    document.getElementById('close-modal').addEventListener('click', closeModal);

    // Close the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('user-modal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Placeholder logout button event listener
    document.getElementById('logout-btn').addEventListener('click', () => {
        alert('Logged out successfully.');
        // Redirect to login page or perform other actions as needed
    });
});

let selectedUserId = null;
let allUsers = [];
let currentTab = 'pending'; // 'pending' or 'approved'

function initializeDummyUsers() {
    const dummyUsers = [
        {
            _id: '1',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            askingRole: 'student',
            status: 'pending',
            additional_info: {
                dateOfBirth: '1998-05-12',
                university: 'Example University',
                major: 'Computer Science',
                studentId: 'S1234567'
            }
        },
        {
            _id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob.smith@example.com',
            roles: ['course_director'],
            status: 'approved',
            additional_info: {
                dateOfBirth: '1980-11-23',
                university: 'Sample College',
                professionalTitle: 'Professor',
                department: 'Mathematics',
                faculty: 'Science',
                staffId: 'D7654321'
            }
        },
        {
            _id: '3',
            firstName: 'Carol',
            lastName: 'Williams',
            email: 'carol.williams@example.com',
            askingRole: 'course_director',
            status: 'pending',
            additional_info: {
                dateOfBirth: '2000-07-30',
                university: 'Tech Institute',
                major: 'Engineering',
                studentId: 'S2345678'
            }
        },
        // Additional Users
        {
            _id: '4',
            firstName: 'David',
            lastName: 'Brown',
            email: 'david.brown@example.com',
            askingRole: 'course_director',
            status: 'pending',
            additional_info: {
                dateOfBirth: '1995-09-15',
                university: 'University of Examples',
                major: 'History',
                studentId: 'S3456789'
            }
        },
        {
            _id: '5',
            firstName: 'Eve',
            lastName: 'Davis',
            email: 'eve.davis@example.com',
            askingRole: 'course_director',
            status: 'pending',
            additional_info: {
                dateOfBirth: '1988-02-20',
                university: 'College of Samples',
                professionalTitle: 'Researcher',
                department: 'Physics',
                faculty: 'Science',
                staffId: 'D8765432'
            }
        },
        {
            _id: '6',
            firstName: 'Frank',
            lastName: 'Miller',
            email: 'frank.miller@example.com',
            askingRole: 'student',
            status: 'pending',
            additional_info: {
                dateOfBirth: '2001-12-05',
                university: 'Institute of Technology',
                major: 'Mechanical Engineering',
                studentId: 'S4567890'
            }
        }
    ];

    // Save dummy users to local storage if not already present
    if (!localStorage.getItem('allUsers')) {
        localStorage.setItem('allUsers', JSON.stringify(dummyUsers));
    }
}

function fetchUsers() {
    // Retrieve users from local storage
    allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    populateUserList();
}

function populateUserList() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Clear existing list

    const filteredUsers = allUsers.filter(user => user.status === currentTab);

    filteredUsers.forEach(user => {
        const listItem = document.createElement('li');
        listItem.dataset.userId = user._id;

        const userInfoDiv = document.createElement('div');
        userInfoDiv.classList.add('user-info');
        userInfoDiv.textContent = `${user.firstName} ${user.lastName} - ${user.email}`;

        const userStatusDiv = document.createElement('div');
        userStatusDiv.classList.add('user-status');

        // Change text based on the current tab
        if (currentTab === 'pending') {
            userStatusDiv.textContent = `Asking Role: ${formatRoles(user.askingRole || user.roles)}`;
        } else {
            userStatusDiv.textContent = `Role: ${formatRoles(user.roles)}`;
        }

        listItem.appendChild(userInfoDiv);
        listItem.appendChild(userStatusDiv);

        listItem.addEventListener('click', () => {
            displayUserDetails(user);
        });
        userList.appendChild(listItem);
    });
}

function formatRoles(roles) {
    if (!roles || roles.length === 0) return 'None';
    if (typeof roles === 'string') return formatKey(roles);
    return roles.map(role => formatKey(role)).join(', ');
}

function switchTab(tab) {
    currentTab = tab;

    // Update active tab styling
    document.querySelectorAll('#navigation li').forEach(li => {
        li.classList.toggle('active', li.dataset.tab === tab);
    });

    // Clear search input
    document.getElementById('search-input').value = '';

    // Repopulate user list
    populateUserList();
}

function filterUserList() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const userListItems = document.querySelectorAll('#user-list li');

    userListItems.forEach(item => {
        const userInfo = item.querySelector('.user-info').textContent.toLowerCase();
        if (userInfo.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function displayUserDetails(user) {
    selectedUserId = user._id;
    const userDetailsDiv = document.getElementById('user-details');
    userDetailsDiv.innerHTML = `
        <p><strong>First Name:</strong> ${user.firstName}</p>
        <p><strong>Last Name:</strong> ${user.lastName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Status:</strong> ${formatStatus(user.status)}</p>
        <p><strong>${user.status === 'pending' ? 'Asking Role' : 'Role'}:</strong> ${formatRoles(user.askingRole || user.roles)}</p>
        <h3>Additional Information</h3>
        ${formatAdditionalInfo(user.additional_info)}
    `;
    
    // Show or hide the role selection dropdown based on user status
    const roleSelectionDiv = document.getElementById('role-selection');
    if (user.status === 'pending') {
        roleSelectionDiv.style.display = 'none';
    } else {
        roleSelectionDiv.style.display = 'block';
        const roleSelect = document.getElementById('role-select');
        roleSelect.value = user.roles && user.roles[0] || 'general_user';
    }

    // Show or hide the Approve and Reject buttons based on user status
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const deleteBtn = document.getElementById('delete-btn');

    if (user.status === 'pending') {
        approveBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
    } else {
        approveBtn.innerHTML = '<i class="fas fa-save"></i> Update';
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'none';
        deleteBtn.style.display = 'inline-block';
    }

    // Show the modal
    openModal();
}

function formatStatus(status) {
    // Convert status code to readable text
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAdditionalInfo(additionalInfo) {
    if (!additionalInfo) return '<p>No additional information provided.</p>';
    let infoHtml = '<ul>';
    for (const key in additionalInfo) {
        if (additionalInfo.hasOwnProperty(key)) {
            infoHtml += `<li><strong>${formatKey(key)}:</strong> ${additionalInfo[key]}</li>`;
        }
    }
    infoHtml += '</ul>';
    return infoHtml;
}

function formatKey(key) {
    // Convert camelCase or snake_case to normal text
    return key.replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase());
}

function handleUserAction(action) {
    if (!selectedUserId) {
        alert('Please select a user first.');
        return;
    }

    // Retrieve user from the allUsers array
    const userIndex = allUsers.findIndex(user => user._id === selectedUserId);

    if (userIndex === -1) {
        alert('User not found.');
        return;
    }

    const user = allUsers[userIndex];

    if (action === 'approve') {
        if (user.status === 'pending') {
            // For pending users, use the askingRole
            allUsers[userIndex].roles = [user.askingRole];
            allUsers[userIndex].status = 'approved';
            delete allUsers[userIndex].askingRole;
            alert('User approved successfully.');
        } else {
            // For approved users, use the selected role
            const selectedRole = document.getElementById('role-select').value;
            allUsers[userIndex].roles = [selectedRole];
            alert('User updated successfully.');
        }
    } else if (action === 'reject') {
        if (user.status === 'pending') {
            allUsers[userIndex].status = 'rejected';
            alert('User rejected successfully.');
        }
    } else if (action === 'delete') {
        let confirmAction = confirm('Are you sure you want to delete this user?');
        if (!confirmAction) return;

        allUsers.splice(userIndex, 1);
        alert('User deleted successfully.');
    }

    // Save updated users back to local storage
    localStorage.setItem('allUsers', JSON.stringify(allUsers));

    // Refresh the user list
    fetchUsers();

    // Close the modal
    closeModal();

    // Reset selected user
    selectedUserId = null;
}

function openModal() {
    const modal = document.getElementById('user-modal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('user-modal');
    modal.style.display = 'none';
    selectedUserId = null;
}
