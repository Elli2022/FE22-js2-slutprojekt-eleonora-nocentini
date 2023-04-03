// Get the DOM elements
const imageSelection = document.getElementById("image-selection") as HTMLSelectElement | null;
const loggedInUsersList = document.getElementById("logged-in-users") as HTMLUListElement | null;
const createAccountButton = document.getElementById("create-account-button") as HTMLButtonElement | null;
const submitButton = document.getElementById("submit-button") as HTMLButtonElement | null;
const usernameInput = document.getElementById("username") as HTMLInputElement | null;
// const imageSelectionInput = document.getElementById("image-selection") as HTMLInputElement | null;  
const passwordInput = document.getElementById("password") as HTMLInputElement | null;
// const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement | null;
const form = document.getElementById('form') as HTMLFormElement | null;
const errorMessage = document.createElement("p");
const userDeletedSuccessfully = document.createElement('h1');
const failedToDeleteUser = document.createElement('h1');
// const inputElement = document.createElement('input') as HTMLInputElement; 
const messageInput = document.createElement('input');
const listItem = document.createElement("li");
const body = document.getElementById('body') as HTMLBodyElement;
const accountCreated = document.createElement("h1");



interface UserInfo {
    userName: any;
    password: string;
    status: string;
    imageurl: string;
    newUser: boolean;
}

interface FirebaseResponse {
    [key: string]: UserInfo;
}

const baseUrl = "https://social-media-68d76-default-rtdb.europe-west1.firebasedatabase.app/";

async function getUsers(): Promise<UserInfo[]> {
    try {
        console.log("Fetching users");
        const response = await fetch(`${baseUrl}users.json`);

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
        console.log(usersArray);
        return usersArray;

    } catch (err) {
        console.log(err);
        throw new Error("Failed to fetch users");
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


//Event listener for the "image dropdown"
if (imageSelection) {
    imageSelection.addEventListener("change", () => {
        const selectedImageUrl = imageSelection.value;
        imageSelection.value = selectedImageUrl;
    });
} else {
    console.error("Image dropdown element not found.");
}


// Event listener for the "create account" button
if (createAccountButton && usernameInput && passwordInput) {
    createAccountButton.addEventListener("click", async () => {
        userDeletedSuccessfully.textContent = " "
        errorMessage.innerText = " ";
        const userName = usernameInput.value;
        const isAvailable = await isUsernameAvailable(userName);
        body.appendChild(accountCreated);
        accountCreated.textContent = "Your account has been successfully created! You may now log in with your new account.";
        if (!isAvailable) {
            errorMessage.textContent = "Username is already taken. Please choose another one.";
            errorMessage.style.color = "red";
            createAccountButton.insertAdjacentElement("afterend", errorMessage);
            return;
        }

        const userInfo: UserInfo = {
            userName: userName,
            password: passwordInput.value,
            status: "",
            imageurl: imageSelection?.value ?? "",
            newUser: true,
        };

        await saveUser(userInfo);
    });
} else {
    console.error("One or more DOM elements not found.");
}

//control already existing users
async function isUsernameAvailable(username: string): Promise<boolean> {
    const users = await getUsers();
    //checks if there's any user in the array with the same username using the some() method.
    return !users.some((user) => user.userName === username);
}

// Displaying already logged in users
function displayLoggedInUsers(users: UserInfo[]): void {
    if (!loggedInUsersList) {
        console.error("Logged-in users list element not found.");
        return;
    }

    loggedInUsersList.innerHTML = "";

    for (const user of users) {
        if (!user.newUser) {
            const listItem = document.createElement("li");
            listItem.textContent = `${user.userName} - Status: ${user.status}`;

            // Create an img element and set its src attribute to the user's image URL
            const userImage = document.createElement("img");
            userImage.src = user.imageurl;
            userImage.style.width = "50px";
            userImage.style.height = "50px";

            // Append the img element to the list item
            listItem.appendChild(userImage);
            loggedInUsersList.appendChild(listItem);

            // Event listener to the list item
            listItem.addEventListener("click", () => {
                displayUserPage(user);
            });
        }
    }
}

function displayUserPage(user: UserInfo): void {
    document.body.innerHTML = "";
    form!.style.display = "none";
    const usersPage = document.createElement('div');
    usersPage.innerHTML = `<h1>Welcome to ${user.userName}'s page! Status:${user.status} </h1>`;
    document.body.appendChild(usersPage);

    // Create an img element and set its src attribute to the user's image URL
    const userImage = document.createElement("img");
    userImage.src = user.imageurl;
    userImage.style.width = "50px";
    userImage.style.height = "50px";
    usersPage.appendChild(userImage);

    // Event listener for the button to get the user back to the login page where every user is logged in.
    const backToLogInPageButton = document.createElement("button");
    backToLogInPageButton.textContent = "Back to Log In Page";
    document.body.appendChild(backToLogInPageButton);
    backToLogInPageButton.addEventListener("click", async () => {


    }
    );
}


// Event listener for the "submit" button
if (submitButton && usernameInput && passwordInput) {
    submitButton.addEventListener("click", async (event: MouseEvent) => {
        event.preventDefault();
        accountCreated.textContent = " ";
        // Remove error message if it exists
        errorMessage.textContent = " ";
        const password = passwordInput.value;
        const users = await getUsers();
        const user = users.find((u) => u.userName === usernameInput.value);
        errorMessage.textContent = "Log In Successfull! ";

        if (!user) {
            errorMessage.textContent = "No account found for this user. Please create an account first.";
            errorMessage.style.color = "red";
            form?.appendChild(errorMessage);
            return;
        }

        // Add password check
        else if (user.password !== password) {
            errorMessage.textContent = "Incorrect password. Please try again.";
            errorMessage.style.color = "red";
            form?.appendChild(errorMessage);
            return;
        }

        // Update the user's status
        user.newUser = false;
        await saveUser(user);

        // Display logged-in users
        displayLoggedInUsers(await getUsers());


        //Log in div for user page
        form!.style.display = "none";
        const logInpage = document.createElement('div');
        logInpage.innerHTML = `<h1>Welcome ${usernameInput.value}!</h1> `;
        document.body.appendChild(logInpage);
        messageInput.id = "status";
        document.body.appendChild(messageInput);
        messageInput.style.width = "100px";
        const sendMessageButton = document.createElement('button');
        sendMessageButton.innerText = "Send statusmessage! "
        sendMessageButton.style.width = "110px";
        document.body.appendChild(sendMessageButton);

        const deleteButton2 = document.createElement('button');
        deleteButton2.innerText = "Delete User";
        document.body.appendChild(deleteButton2);



        deleteButton2?.addEventListener("click", async (event) => {
            event?.preventDefault();
            listItem.textContent = " ";
            if (usernameInput) {
                await deleteUser(usernameInput.value);
                errorMessage.textContent = " ";
            } else {
                console.error("Username input element not found.");
            }
        });

        async function deleteUser(username: string): Promise<void> {
            console.log("Deleting user");
            const url = `${baseUrl}users/${username}.json`;
            const init = {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            };

            try {
                const response = await fetch(url, init);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                console.log("User deleted successfully");
                userDeletedSuccessfully.textContent = "User deleted successfully!"
                document.body.appendChild(userDeletedSuccessfully);

            
                // Display logged-in users
                displayLoggedInUsers(await getUsers());
                messageInput.style.display="none";
                logInpage.innerHTML = "";
                sendMessageButton.style.display="none";

            } catch (err) {
                console.log(err);
                failedToDeleteUser.textContent = "Failed to delete user. Please try again.";
                document.body.appendChild(failedToDeleteUser);
                throw new Error("Failed to delete user.");

            }
        }


        sendMessageButton.addEventListener("click", async () => {
            const status = messageInput.value;
            //PROBLEM HÄR!!!!!!!!!!! FUNKAR nu? TEST JAAAAA det funkar jag är ett fucking geni.(oftast inte. Bara ibland. som här)
            const url = `${baseUrl}users/${user.userName}/status.json`;
            const init = {
                method: "PUT",
                body: JSON.stringify(status),
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

            // Display logged-in users
            displayLoggedInUsers(await getUsers());
           
        });
    });
} else {
    console.error("One or more DOM elements not found.");
}

