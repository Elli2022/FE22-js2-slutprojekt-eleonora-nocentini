// Get the DOM elements
const imageSelection = document.getElementById("image-selection") as HTMLSelectElement | null;
const loggedInUsersList = document.getElementById("logged-in-users") as HTMLUListElement | null;
const createAccountButton = document.getElementById("create-account-button") as HTMLButtonElement | null;
const submitButton = document.getElementById("submit-button") as HTMLButtonElement | null;
const usernameInput = document.getElementById("username") as HTMLInputElement | null;
const statusInput = document.getElementById("status") as HTMLInputElement | null;
const imageSelectionInput = document.getElementById("image-selection") as HTMLInputElement | null; // Unused variable, consider removing it
const passwordInput = document.getElementById("password") as HTMLInputElement | null;
const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement | null; // Unused variable, consider removing it
const form = document.getElementById('form') as HTMLFormElement | null;
const errorMessage = document.createElement("p");
// const deleteButton = document.getElementById('delete-account-button') as HTMLButtonElement | null; // Added "as HTMLButtonElement | null"
const userDeletedSuccessfully = document.createElement('h1');
const failedToDeleteUser = document.createElement('h1');
const inputElement = document.createElement('input') as HTMLInputElement; // Unused variable, consider removing it




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
if (createAccountButton && usernameInput && passwordInput && statusInput) {
    createAccountButton.addEventListener("click", async () => {
        userDeletedSuccessfully.textContent = " "
        errorMessage.innerText = " ";
        const userName = usernameInput.value;
        const isAvailable = await isUsernameAvailable(userName);
        if (!isAvailable) {
            errorMessage.textContent = "Username is already taken. Please choose another one.";
            errorMessage.style.color = "red";
            createAccountButton.insertAdjacentElement("afterend", errorMessage);
            return;
        }

        const userInfo: UserInfo = {
            userName: userName,
            password: passwordInput.value,
            status: statusInput.value,
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

//already logeedd in users
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
            userImage.style.width = "50px"; // Set the image width (optional)
            userImage.style.height = "50px"; // Set the image height (optional)

            // Append the img element to the list item
            listItem.appendChild(userImage);
            loggedInUsersList.appendChild(listItem);
        }
    }
}



// Event listener for the "submit" button
if (submitButton && usernameInput && passwordInput && statusInput) {
    submitButton.addEventListener("click", async (event: MouseEvent) => {
        event.preventDefault();
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
        user.status = statusInput.value; // Add this line to update the status
        user.newUser = false;
        await saveUser(user);

        // Display logged-in users
        displayLoggedInUsers(await getUsers());

        //Log in div for user page
        form!.style.display = "none";
        const logInpage = document.createElement('div');
        logInpage.innerHTML = `<h1>Welcome ${usernameInput.value}!</h1> `;
        document.body.appendChild(logInpage);
        
        const messageInput = document.createElement('input');
        messageInput.id = "status";
        document.body.appendChild(messageInput);
        messageInput.style.width = "100px";
        const sendMessageButton = document.createElement('button');
        sendMessageButton.innerText = "Send statusmessage! "
        sendMessageButton.style.width = "110px";
        document.body.appendChild(sendMessageButton);

        const deleteButton2 = document.createElement('button');
        deleteButton2.innerText = "Delete User"; // Set inner text for the delete button
        document.body.appendChild(deleteButton2); // Append delete button to the document body
        

        
        deleteButton2?.addEventListener("click", async (event) => {
                event?.preventDefault();
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
                } catch (err) {
                    console.log(err);
                    failedToDeleteUser.textContent = "User deleted successfully!"
                    document.body.appendChild(failedToDeleteUser);
                    throw new Error("Failed to delete user.");
            
                }
            }
            
            
        sendMessageButton.addEventListener("click", async () => { 
            const status = messageInput.value;
            //PROBLEM HÄR!!!!!!!!!!! FUNKAR nu? TEST
            const url = `${baseUrl}users/${user.userName}/status.json`;
            const init = {
                method: "PUT",
                body: JSON.stringify(status),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            };
            try {
                const response = await fetch(url, init); // Added "await"

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
            } catch (err) {
                console.log(err);
                throw new Error("Failed to save user information.");
            }
        });
    });
} else {
    console.error("One or more DOM elements not found.");
}
