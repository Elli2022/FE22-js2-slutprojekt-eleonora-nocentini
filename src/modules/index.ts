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
        const users: Record<string, User> | null = await response.json();

        if (!users) {
            console.log("No users found.");
            return [];
        }

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

// Function to save users to the database
async function saveUsers(users: User[]): Promise<void> {
    await fetch(baseUrl + "users.json", {
        method: "PUT",
        body: JSON.stringify(users),
    });
}

getUsers();

function createUser(name: string, password: string): User {
    const id = generateUniqueId();
    return {
        id,
        name,
        is_new_user: true,
    };
}

function generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

//Button to create a new account for new users
const createAccountButton = document.getElementById("create-account-button");
if (createAccountButton) {
    createAccountButton.addEventListener("click", async () => {
        const name = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("create-account-password") as HTMLInputElement).value;
        const newUser = createUser(name, password);
        const users = await getUsers();
        users.push(newUser);
        await saveUsers(users);
    });
} else {
    console.error("Create account button not found");
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
    await saveUsers(users);
    window.location.href = "index.html";
});

//update the user object in the database
async function updateUser(objectToUpdate: User): Promise<void> {
console.log(objectToUpdate);
const users = await getUsers();
const index = users.findIndex(user => user.id === objectToUpdate.id);
users[index] = objectToUpdate;
await saveUsers(users);
window.location.href = "index.html";
return;
}


