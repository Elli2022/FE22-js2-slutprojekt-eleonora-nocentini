// Get the DOM elements
const createAccountButton = document.getElementById("create-account-button") as HTMLButtonElement | null;
const usernameInput = document.getElementById("username") as HTMLInputElement | null;
const createAccountPasswordInput = document.getElementById("create-account-password") as HTMLInputElement | null;
const statusInput = document.getElementById("status") as HTMLInputElement | null;
const imageUrlInput = document.getElementById("image-url") as HTMLInputElement | null;


interface UserInfo {
    userName: string;
    password: string;
    status: string;
    imageurl: string;
    newUser: boolean;
    // Add any other properties that users have in your data
}

interface FirebaseResponse {
    [key: string]: UserInfo;
}

const baseUrl = "https://social-media-68d76-default-rtdb.europe-west1.firebasedatabase.app/";

async function getUsers(): Promise<UserInfo[]> {
    try {
        console.log("Fetching users...");
        const response = await fetch(`${baseUrl}.json`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const users: FirebaseResponse | null = await response.json();

        if (!users) {
            console.log("No users found.");
            return [];
        }

        console.log(users);
        const usersArray: UserInfo[] = Object.values(users);
        const newOrOldUsers: UserInfo[] = usersArray.filter((user) => user.newUser ?? true);
        return newOrOldUsers;
    } catch (err) {
        console.log(err);
        throw new Error("Failed to fetch users.");
    }
}

//uppdate the users array
async function saveUser(user: UserInfo): Promise<void> {
    console.log("Saving user...");
    const arrData = await getUsers();
    console.log(arrData);
;

    const url = `${baseUrl}users/${user.userName}.json`;
    const init = {
        method: "PUT",
        body: JSON.stringify(user),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    };

    try {
        const response = await fetch(url, init);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        console.log(err);
        throw new Error("Failed to save user information.");
    }
}



// Event listener for the "create account" button
if (createAccountButton && usernameInput && createAccountPasswordInput && statusInput && imageUrlInput) {
    createAccountButton.addEventListener("click", async () => {
        const userInfo: UserInfo = {
            userName: usernameInput.value,
            password: createAccountPasswordInput.value,
            status: statusInput.value,
            imageurl: imageUrlInput.value,
            newUser: true,
        };

        await saveUser(userInfo);
    });
} else {
    console.error("One or more DOM elements not found.");
}

// Event listener for the "submit" button
const submitButton = document.getElementById("submit-button") as HTMLButtonElement | null;
if (submitButton && usernameInput) {
    submitButton.addEventListener("click", async (event: MouseEvent) => {
        event.preventDefault();

        const passwordInput = document.getElementById("password") as HTMLInputElement | null;
        const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement | null;

        if (!passwordInput || !confirmPasswordInput) {
            console.error("One or more DOM elements not found.");
            return;
        }

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const users = await getUsers();
        const user = users.find((u) => u.userName === usernameInput.value);


        if (!user) {
            alert("User not found");
            return;
        }

        user.newUser = false;
        await saveUser(user);
        window.location.href = "index.html";

    });
} else {
    console.error("One or more DOM elements not found.");
}