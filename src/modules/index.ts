// Get the DOM elements
const createAccountButton = document.getElementById("create-account-button") as HTMLButtonElement | null;
const submitButton = document.getElementById("submit-button") as HTMLButtonElement | null;
const usernameInput = document.getElementById("username") as HTMLInputElement | null;
const PasswordInput = document.getElementById("password") as HTMLInputElement | null;
const statusInput = document.getElementById("status") as HTMLInputElement | null;
const imageUrlInput = document.getElementById("image-url") as HTMLInputElement | null;
const userNameInput = document.getElementById("user-name") as HTMLInputElement | null;
const passwordInput = document.getElementById("password") as HTMLInputElement | null;
const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement | null;


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
    console.log("Saving user");
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
if (createAccountButton && usernameInput && passwordInput && statusInput && imageUrlInput) {
  createAccountButton.addEventListener("click", async () => {
    const userName = usernameInput.value;
    const isAvailable = await isUsernameAvailable(userName);

    if (!isAvailable) {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Username is already taken. Please choose another one.";
      errorMessage.style.color = "red";
      createAccountButton.insertAdjacentElement("afterend", errorMessage);
      return;
    }

    const userInfo: UserInfo = {
      userName: userName,
      password: passwordInput.value,
      status: statusInput.value,
      imageurl: imageUrlInput.value,
      newUser: true,
    };

    await saveUser(userInfo);
  });
} else {
  console.error("One or more DOM elements not found.");
}

async function isUsernameAvailable(username: string): Promise<boolean> {
  const users = await getUsers();
  return !users.some((user) => user.userName === username);
}


// Event listener for the "Login" button

if (submitButton && usernameInput) {
    submitButton.addEventListener("click", async (event: MouseEvent) => {
        event.preventDefault();

        if (!passwordInput) {
            console.error("Wrong password");
            return;
        }

        const password = passwordInput.value;
        const users = await getUsers();
        const user = users.find((u) => u.userName === usernameInput.value);

        if (!user) {
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "No account found for this user. Please create an account first.";
            errorMessage.style.color = "red";
            submitButton.insertAdjacentElement("afterend", errorMessage);
            return;
        }

        user.newUser = false;
        await saveUser(user);
        window.location.href = "successLogin.html"; // replace "new-page.html" with the name of the page you want to redirect to
    });
} else {
    console.error("One or more DOM elements not found.");
}
