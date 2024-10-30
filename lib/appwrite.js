import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";


export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.m56.health",
  projectId: "672098150018cae2fdd2",
  storageId: "6720b79e002af375ad21", 
  databaseId: "672099030012daedce13",
  userCollectionId: "6720991c000eb2ef2e92",
  prescriptionId: "6720b7f80016c3f4f12b",

  bpCollectionId: "67214a9a0006e3b043a1",
  bloodSugarCollectionId: "67214cf1000ebd549136"

  medicationCollectionId: "67215382000874066c3d",

};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const databases = new Databases(client);

// Function to fetch BP data for a user
export async function fetchBPData(userId) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bpCollectionId,
      [Query.equal("userId", userId)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching BP data:", error);
    throw error;
  }
}

// Function to fetch Blood Sugar data for a user
export async function fetchBloodSugarData(userId) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bloodSugarCollectionId,
      [Query.equal("userId", userId)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching Blood Sugar data:", error);
    throw error;
  }
}


export async function submitBPData(userId, systolic, diastolic) {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bpCollectionId,
      ID.unique(),
      {
        userId,
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        timestamp: new Date().toISOString(),
      },
      [Permission.read(Role.user(userId)), Permission.write(Role.user(userId))] // Set permissions here
    );
    return response;
  } catch (error) {
    console.error("Error submitting BP data:", error);
    throw error;
  }
}

export async function submitBloodSugarData(userId, bloodSugar) {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bloodSugarCollectionId,
      ID.unique(),
      {
        userId,
        value: parseFloat(bloodSugar),
        timestamp: new Date().toISOString(),
      },
      [Permission.read(Role.user(userId)), Permission.write(Role.user(userId))] // Set permissions here
    );
    return response;
  } catch (error) {
    console.error("Error submitting Blood Sugar data:", error);
    throw error;
  }
}




//
export const updateUserProfile = async (userId, data) => {
  try {
    return await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      data
    );
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
};


export async function getUsername() {
  try {
    const user = await account.get(); // Retrieves the current user's data
    return user.name || 'User'; // Use 'name' property if available
  } catch (error) {
    console.error("Failed to fetch username:", error);
    return 'User';
  }
}


// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    throw new Error("Failed to fetch user account");
  }
}


// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}




// Prescription functions


// Upload prescription file
export const uploadPrescriptionFile = async (file) => {
  if (!file) return;

  const { uri, mimeType, name } = file;
  const formData = new FormData();

  formData.append("fileId", "unique()");
  formData.append("file", {
    uri,
    name,
    type: mimeType,
  });

  try {
    const response = await fetch(`${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageId}/files`, {
      method: "POST",
      headers: {
        "X-Appwrite-Project": appwriteConfig.projectId,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.$id) {
      throw new Error(`Failed to upload file: ${result.message || response.statusText}`);
    }

    console.log("Uploaded file ID:", result.$id); // Debugging step
    return result.$id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};







// Create a prescription record in the database
export const createPrescriptionRecord = async (userId, fileId, fileType) => {
  try {
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.prescriptionId,
      ID.unique(),
      {
        userId,
        fileId,
        fileType,
        status: "active", // Set default status; can be "active" or "inactive"
      }
    );
  } catch (error) {
    console.error("Error creating prescription record:", error);
    throw error;
  }
};


// Retrieve prescriptions by user ID
export const getPrescriptions = async (userId) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.prescriptionId,
      [Query.equal("userId", userId)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw error;
  }
};

// Update the status of a prescription
export const updatePrescriptionStatus = async (prescriptionId, newStatus) => {
  const validStatuses = ["active", "inactive"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid status value. Only 'active' or 'inactive' are allowed.");
  }
  try {
    return await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.prescriptionId,
      prescriptionId,
      {
        status: newStatus,
      }
    );
  } catch (error) {
    console.error("Error updating prescription status:", error);
    throw error;
  }
};

// Get file preview
export const getFilePreview = (fileId, fileType) => {
  if (fileType === "application/pdf") {
    return storage.getFileView(appwriteConfig.storageId, fileId).toString(); // Ensure it’s a string
  } else {
    return storage.getFilePreview(appwriteConfig.storageId, fileId).toString(); // Ensure it’s a string
  }
};
