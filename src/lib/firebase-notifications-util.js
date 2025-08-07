import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { app } from "../../firebase.js";

// Initialize Firestore
export const db = getFirestore(app);

// Collection reference
export const usersCollection = collection(db, "users");

// Add new user (only Project Details fields)
export const addUser = async (userData) => {
  try {
    // Only include Project Details fields
    const projectDetails = {
      projectId: userData.projectId,
      nameOfGrower: userData.nameOfGrower,
      parentageOfGrower: userData.parentageOfGrower,
      addressOfGrower: userData.addressOfGrower,
      phoneNumber: userData.phoneNumber,
      plotSize: userData.plotSize,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(usersCollection, projectDetails);
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to add user: ${error.message}`);
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

// Update user (only Project Details fields)
export const updateUser = async (userId, userData) => {
  try {
    const docRef = doc(db, "users", userId);

    // Only update Project Details fields
    const projectDetails = {
      projectId: userData.projectId,
      nameOfGrower: userData.nameOfGrower,
      parentageOfGrower: userData.parentageOfGrower,
      addressOfGrower: userData.addressOfGrower,
      phoneNumber: userData.phoneNumber,
      plotSize: userData.plotSize,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, projectDetails);
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

// Get total count of users
export const getTotalUsersCount = async () => {
  try {
    const snapshot = await getDocs(usersCollection);
    return snapshot.size;
  } catch (error) {
    throw new Error(`Failed to get users count: ${error.message}`);
  }
};

// Get users with pagination by page number
export const getUsersByPage = async (page = 1, pageSize = 10) => {
  try {
    const offset = (page - 1) * pageSize;

    // Get all users sorted by createdAt desc
    const q = query(usersCollection, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const allUsers = [];

    querySnapshot.forEach((doc) => {
      allUsers.push({ id: doc.id, ...doc.data() });
    });

    // Get the users for the current page
    const users = allUsers.slice(offset, offset + pageSize);
    const totalUsers = allUsers.length;
    const totalPages = Math.ceil(totalUsers / pageSize);

    return {
      users,
      totalUsers,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    };
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

// Search users by project ID or name with case-insensitive partial matching
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    // Get all users first (since Firestore doesn't support case-insensitive search directly)
    const allUsersQuery = query(usersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(allUsersQuery);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Filter users on client side for flexible matching
    const searchTermLower = searchTerm.toLowerCase();

    return users.filter((user) => {
      const projectId = (user.projectId || "").toLowerCase();
      const nameOfGrower = (user.nameOfGrower || "").toLowerCase();

      return (
        projectId.includes(searchTermLower) ||
        nameOfGrower.includes(searchTermLower)
      );
    });
  } catch (error) {
    throw new Error(`Failed to search users: ${error.message}`);
  }
};

// Task management functions
export const addTaskToUser = async (userId, date, task) => {
  try {
    const userRef = doc(db, "users", userId);
    const taskData = {
      id: Date.now().toString(), // Simple ID generation
      title: task.title,
      description: task.description,
      sendNotification: task.sendNotification, // Always present
      createdAt: new Date().toISOString(),
      date: date,
    };

    // Add SMS-related data if notification is enabled
    if (task.sendNotification === "yes") {
      taskData.template_id = task.template_id;
      taskData.template_title = task.template_title;
      taskData.template_text = task.template_text;
      taskData.variables = task.variables;
      taskData.scheduleDate = task.scheduleDate;
      taskData.scheduleTime = task.scheduleTime;
    }

    // Get current user data
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // Initialize tasks object if it doesn't exist
    const tasks = userData.tasks || {};

    // Initialize array for the date if it doesn't exist
    if (!tasks[date]) {
      tasks[date] = [];
    }

    // Add the new task
    tasks[date].push(taskData);

    // Update the user document
    await updateDoc(userRef, { tasks });

    return taskData;
  } catch (error) {
    throw new Error(`Failed to add task: ${error.message}`);
  }
};

export const deleteTaskFromUser = async (userId, date, taskId) => {
  try {
    const userRef = doc(db, "users", userId);

    // Get current user data
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData.tasks || !userData.tasks[date]) {
      throw new Error("No tasks found for this date");
    }

    // Filter out the task to delete
    const updatedTasks = userData.tasks[date].filter(
      (task) => task.id !== taskId
    );

    // Update the tasks object
    const tasks = { ...userData.tasks };
    if (updatedTasks.length === 0) {
      delete tasks[date]; // Remove the date key if no tasks left
    } else {
      tasks[date] = updatedTasks;
    }

    // Update the user document
    await updateDoc(userRef, { tasks });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
};

export const getTasksForUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    return userData.tasks || {};
  } catch (error) {
    throw new Error(`Failed to get tasks: ${error.message}`);
  }
};
