"use client";

//this context handles both the firestor as well as storage
import React, { createContext, useContext, useEffect, useState } from "react";
import { app } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const FirestoreContext = createContext();

export const FirestoreProvider = ({ children }) => {
  const [adminsData, setAdminsData] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const fetchData = async () => {
      const adminQuerySnapshot = await getDocs(collection(db, "admins"));
      const fetchedAdmins = adminQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdminsData(fetchedAdmins);
      const blogQuerySnapshot = await getDocs(collection(db, "blogs"));
      const fetchedBlogs = blogQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogsData(fetchedBlogs);
      const statQuerySnapshot = await getDocs(collection(db, "stats"));
      const fetchedStats = statQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStatsData(fetchedStats);
      setLoading(false);
    };

    fetchData();
  }, [db]);

  const addData = async (newData, collec) => {
    if (collec === "admins") {
      try {
        setLoading(true);
        const isEmailPresent = adminsData.some(
          (admin) => admin.email === newData.email
        );
        if (isEmailPresent) {
          setLoading(false);
          return {
            success: false,
            message: "Cannot add! Email already exists",
          };
        }
        const docRef = await addDoc(collection(db, collec), newData);
        setAdminsData((prevData) => [
          ...prevData,
          { id: docRef.id, ...newData },
        ]);
        setLoading(false);
        return { success: true, message: "Admin added successfully!" };
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }
    if (collec === "blogs") {
      setLoading(true);
      try {
        // Upload the image to Firebase Storage
        const imageRef = ref(storage, `blogs/${newData.imageId}`);
        await uploadBytes(imageRef, newData.image);

        // Get the image URL
        const imageUrl = await getDownloadURL(imageRef);

        // Format the timestamp
        const timestamp = new Date().toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Add blog data to Firestore
        const blogData = {
          title: newData.title,
          brief: newData.brief,
          content: newData.content,
          imageId: newData.imageId,
          imageUrl,
          date: timestamp,
          uploader: "admin",
        };

        const docRef = await addDoc(collection(db, "blogs"), blogData);
        setBlogsData((prevData) => [
          ...prevData,
          { id: docRef.id, ...blogData },
        ]);
        setLoading(false);
        return { success: true, message: "Blog added successfully!" };
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }
  };

  const deleteData = async (id, collec) => {
    if (collec === "admins") {
      await deleteDoc(doc(db, collec, id));
      setAdminsData((prevData) => prevData.filter((item) => item.id !== id));
      return { success: true, message: "Admin deleted!" };
    }
    if (collec === "blogs") {
      try {
        // Find the blog to delete to get its image URL
        const blogToDelete = blogsData.find((blog) => blog.id === id);
        if (blogToDelete) {
          // Delete the blog document from Firestore
          await deleteDoc(doc(db, "blogs", id));

          // Delete the image from Firebase Storage
          const imageRef = ref(storage, `blogs/${blogToDelete.imageId}`);
          await deleteObject(imageRef);

          // Update local state
          setBlogsData((prevData) => prevData.filter((item) => item.id !== id));
          return { success: true, message: "Blog deleted successfully!" };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  };

  const updateData = async (id, newData, collec) => {
    if (collec === "admins") {
      try {
        setLoading(true);
        const docRef = doc(db, "admins", id);
        await updateDoc(docRef, newData);
        setAdminsData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, ...newData } : item
          )
        );
        setLoading(false);
        return { success: true, message: "Admin updated successfully!" };
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }

    if (collec === "blogs") {
      try {
        setLoading(true);

        // Find the blog to update
        const blogToUpdate = blogsData.find((blog) => blog.id === id);
        if (blogToUpdate) {
          let imageUrl = blogToUpdate.imageUrl;

          // If a new image is provided, delete the old image and upload the new one
          if (newData.image) {
            // Delete old image from Firebase Storage
            const oldImageRef = ref(storage, `blogs/${blogToUpdate.imageId}`);
            await deleteObject(oldImageRef);

            // Upload new image to Firebase Storage
            const newImageRef = ref(storage, `blogs/${newData.imageId}`);
            await uploadBytes(newImageRef, newData.image);
            imageUrl = await getDownloadURL(newImageRef);
          }

          // Format the timestamp
          const timestamp = new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          // Update blog data in Firestore
          const updatedBlogData = {
            title: newData.title || blogToUpdate.title,
            brief: newData.brief || blogToUpdate.brief,
            content: newData.content || blogToUpdate.content,
            imageId: newData.imageId || blogToUpdate.imageId,
            imageUrl,
            date: timestamp,
            uploader: "admin",
          };

          const docRef = doc(db, "blogs", id);
          await updateDoc(docRef, updatedBlogData);

          // Update local state
          setBlogsData((prevData) =>
            prevData.map((item) =>
              item.id === id ? { id, ...updatedBlogData } : item
            )
          );

          setLoading(false);
          return { success: true, message: "Blog updated successfully!" };
        }
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }

    if (collec === "stats") {
      try {
        setLoading(true);
        const docRef = doc(db, "stats", id);
        await updateDoc(docRef, newData);
        setStatsData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, ...newData } : item
          )
        );
        setLoading(false);
        return { success: true, message: "Stat updated successfully!" };
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }
  };

  return (
    <FirestoreContext.Provider
      value={{
        adminsData,
        blogsData,
        statsData,
        loading,
        addData,
        deleteData,
        updateData,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  return useContext(FirestoreContext);
};
