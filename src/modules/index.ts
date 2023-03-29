type User = {
    id: string;
    name: string;
    is_new_user: boolean;
    // Add any other properties that users have in your data
};

const baseUrl = "https://social-media-68d76-default-rtdb.europe-west1.firebasedatabase.app/";

async function getUsers(): Promise<User[]> {
    try {
        console.log("Fetching users...");
        const response = await fetch(baseUrl + "users.json");
        const users: Record<string, User> = await response.json();
        console.log(users);
        const usersArray: User[] = Object.values(users);
        let newOrOldUsers: User[] = usersArray.filter(user => user.is_new_user);
        return newOrOldUsers;
    } catch (err) {
        console.log(err);
        let errorMessage = document.createElement('h1');
        errorMessage.innerText = "Something went wrong. Please try again later.";
        document.body.appendChild(errorMessage);
        return [];
    }
}

getUsers();

// Function to create a new user object
function createUser(name: string, password: string): User {
    return {
        id: "", // You might want to generate a unique ID here
        name,
        is_new_user: true, // Assuming new users have this property set to true
        // Add any other properties that users have in your data and set their values
    };
}

// Submit button for old users to login
const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
submitButton.addEventListener('click', async function (event: MouseEvent) {
    event.preventDefault();
    const userName = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const user = createUser(userName, password);
    const users = await getUsers();
    users.push(user);
    const usersArray = users.map(user => user);
    localStorage.setItem('users', JSON.stringify(usersArray));
    window.location.href = "index.html";
});

