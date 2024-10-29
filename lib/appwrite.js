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
};
// appwrite.js




const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const databases = new Databases(client);


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

// // Upload File
// export async function uploadFile(file, type) {
//   if (!file) return;

//   const { mimeType, ...rest } = file;
//   const asset = { type: mimeType, ...rest };

//   try {
//     const uploadedFile = await storage.createFile(
//       appwriteConfig.storageId,
//       ID.unique(),
//       asset
//     );

//     const fileUrl = await getFilePreview(uploadedFile.$id, type);
//     return fileUrl;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// // Get File Preview
// export async function getFilePreview(fileId, type) {
//   let fileUrl;

//   try {
//     if (type === "video") {
//       fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
//     } else if (type === "image") {
//       fileUrl = storage.getFilePreview(
//         appwriteConfig.storageId,
//         fileId,
//         2000,
//         2000,
//         "top",
//         100
//       );
//     } else {
//       throw new Error("Invalid file type");
//     }

//     if (!fileUrl) throw Error;

//     return fileUrl;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// // Create Video Post
// export async function createVideoPost(form) {
//   try {
//     const [thumbnailUrl, videoUrl] = await Promise.all([
//       uploadFile(form.thumbnail, "image"),
//       uploadFile(form.video, "video"),
//     ]);

//     const newPost = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.videoCollectionId,
//       ID.unique(),
//       {
//         title: form.title,
//         thumbnail: thumbnailUrl,
//         video: videoUrl,
//         prompt: form.prompt,
//         creator: form.userId,
//       }
//     );

//     return newPost;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// // Get all video Posts
// export async function getAllPosts() {
//   try {
//     const posts = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.videoCollectionId
//     );

//     return posts.documents;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// // Get video posts created by user
// export async function getUserPosts(userId) {
//   try {
//     const posts = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.videoCollectionId,
//       [Query.equal("creator", userId)]
//     );

//     return posts.documents;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// // Get video posts that matches search query
// export async function searchPosts(query) {
//   try {
//     const posts = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.videoCollectionId,
//       [Query.search("title", query)]
//     );

//     if (!posts) throw new Error("Something went wrong");

//     return posts.documents;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// // Get latest created video posts
// export async function getLatestPosts() {
//   try {
//     const posts = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.videoCollectionId,
//       [Query.orderDesc("$createdAt"), Query.limit(7)]
//     );

//     return posts.documents;
//   } catch (error) {
//     throw new Error(error);
//   }
// }
