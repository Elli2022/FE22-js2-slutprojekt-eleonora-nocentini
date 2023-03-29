

const baseUrl="https://social-media-68d76-default-rtdb.europe-west1.firebasedatabase.app/";

async function getUsers(){
    try{
        console.log("Fetching users...");
        const response=await fetch(baseUrl+"users.json");
        const users=await response.json();
        return users;
    }
    catch(err){
        console.log(err);
    }
}