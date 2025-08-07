"use client";

//this context handles both the firestor as well as storage
import React, { createContext, useContext, useEffect, useState } from "react";
import { app } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  getFirestore,
  updateDoc,
  getCountFromServer,
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
  const [projectsData, setProjectsData] = useState([]);
  const [applesData, setApplesData] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [alertData, setAlertData] = useState([]);
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
      const projectQuerySnapshot = await getDocs(collection(db, "projects"));
      const fetchedProjects = projectQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjectsData(fetchedProjects);
      const appleQuerySnapshot = await getDocs(collection(db, "apples"));
      const fetchedApples = appleQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplesData(fetchedApples);
      const alertQuerySnapshot = await getDocs(collection(db, "alert"));
      const fetchedAlert = alertQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlertData(fetchedAlert);
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getCountFromServer(usersCollection);

      setUsersCount(usersSnapshot.data().count);
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
        await setDoc(doc(db, collec, newData.email), newData);
        setAdminsData((prevData) => [
          ...prevData,
          { id: newData.email, ...newData },
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
    if (collec === "projects") {
      setLoading(true);
      try {
        // Upload the image to Firebase Storage
        const imageRef = ref(storage, `projects/${newData.imageId}`);
        await uploadBytes(imageRef, newData.image);

        // Get the image URL
        const imageUrl = await getDownloadURL(imageRef);

        // Add project data to Firestore
        const projectData = {
          title: newData.title,
          brief: newData.brief,
          imageId: newData.imageId,
          imageUrl,
          name: newData.name,
          address: newData.address,
          start: newData.start,
          end: newData.end,
          size: newData.size,
          appleType: newData.appleType,
        };

        const docRef = await addDoc(collection(db, "projects"), projectData);
        setProjectsData((prevData) => [
          ...prevData,
          { id: docRef.id, ...projectData },
        ]);
        setLoading(false);
        return { success: true, message: "Project added successfully!" };
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }
    if (collec === "apples") {
      setLoading(true);
      try {
        // Upload the image to Firebase Storage
        const imageRef = ref(storage, `apples/${newData.imageId}`);
        await uploadBytes(imageRef, newData.image);

        // Get the image URL
        const imageUrl = await getDownloadURL(imageRef);

        // Upload the pdf to Firebase Storage
        const pdfRef = ref(storage, `apples/${newData.pdfId}`);
        await uploadBytes(pdfRef, newData.pdfFile);

        // Get the image URL
        const pdfUrl = await getDownloadURL(pdfRef);

        // Add project data to Firestore
        const appleData = {
          title: newData.title,
          characteristics: newData.characteristics,
          imageId: newData.imageId,
          imageUrl,
          colour: newData.colour,
          flavour: newData.flavour,
          shape: newData.shape,
          skin: newData.skin,
          fruitFlesh: newData.fruitFlesh,
          vigour: newData.vigour,
          blossom: newData.blossom,
          pollinator: newData.pollinator,
          growth: newData.growth,
          maturity: newData.maturity,
          size: newData.size,
          companyExp: newData.companyExp,
          pdfId: newData.pdfId,
          pdfUrl,
          pdfName: newData.pdfName,
        };

        const docRef = await addDoc(collection(db, "apples"), appleData);
        setApplesData((prevData) => [
          ...prevData,
          { id: docRef.id, ...appleData },
        ]);
        setLoading(false);
        return { success: true, message: "Variety added successfully!" };
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }
    if (collec === "alert") {
      setLoading(true);
      try {
        // Upload the image to Firebase Storage
        const imageRef = ref(storage, `alert/${newData.imageId}`);
        await uploadBytes(imageRef, newData.image);

        // Get the image URL
        const imageUrl = await getDownloadURL(imageRef);

        // Add alert data to Firestore
        const alertData = {
          title: newData.title,
          brief: newData.brief,
          imageId: newData.imageId,
          imageUrl,
          date: newData.date,
          publish: newData.publish,
        };

        const docRef = await addDoc(collection(db, "alert"), alertData);
        setAlertData((prevData) => [
          ...prevData,
          { id: docRef.id, ...alertData },
        ]);
        setLoading(false);
        return { success: true, message: "Alert added successfully!" };
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
    if (collec === "projects") {
      try {
        // Find the project to delete to get its image URL
        const projectToDelete = projectsData.find(
          (project) => project.id === id
        );
        if (projectToDelete) {
          // Delete the project document from Firestore
          await deleteDoc(doc(db, "projects", id));

          // Delete the image from Firebase Storage
          const imageRef = ref(storage, `projects/${projectToDelete.imageId}`);
          await deleteObject(imageRef);

          // Update local state
          setProjectsData((prevData) =>
            prevData.filter((item) => item.id !== id)
          );
          return { success: true, message: "Project deleted successfully!" };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
    if (collec === "apples") {
      try {
        // Find the project to delete to get its image URL
        const appleToDelete = applesData.find((apple) => apple.id === id);
        if (appleToDelete) {
          // Delete the project document from Firestore
          await deleteDoc(doc(db, "apples", id));

          // Delete the image from Firebase Storage
          const imageRef = ref(storage, `apples/${appleToDelete.imageId}`);
          await deleteObject(imageRef);

          // Delete the image from Firebase Storage
          const pdfRef = ref(storage, `apples/${appleToDelete.pdfId}`);
          await deleteObject(pdfRef);

          // Update local state
          setApplesData((prevData) =>
            prevData.filter((item) => item.id !== id)
          );
          return { success: true, message: "Variety deleted successfully!" };
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

    if (collec === "projects") {
      try {
        setLoading(true);

        // Find the project to update
        const projectToUpdate = projectsData.find(
          (project) => project.id === id
        );
        if (projectToUpdate) {
          let imageUrl = projectToUpdate.imageUrl;

          // If a new image is provided, delete the old image and upload the new one
          if (newData.image) {
            // Delete old image from Firebase Storage
            const oldImageRef = ref(
              storage,
              `projects/${projectToUpdate.imageId}`
            );
            await deleteObject(oldImageRef);

            // Upload new image to Firebase Storage
            const newImageRef = ref(storage, `projects/${newData.imageId}`);
            await uploadBytes(newImageRef, newData.image);
            imageUrl = await getDownloadURL(newImageRef);
          }

          // Update project data in Firestore
          const updatedProjectData = {
            title: newData.title || projectToUpdate.title,
            brief: newData.brief || projectToUpdate.brief,
            imageId: newData.imageId || projectToUpdate.imageId,
            imageUrl,
            name: newData.name || projectToUpdate.name,
            address: newData.address || projectToUpdate.address,
            start: newData.start || projectToUpdate.start,
            end: newData.end || projectToUpdate.end,
            size: newData.size || projectToUpdate.size,
            appleType: newData.appleType || projectToUpdate.appleType,
          };

          const docRef = doc(db, "projects", id);
          await updateDoc(docRef, updatedProjectData);

          // Update local state
          setProjectsData((prevData) =>
            prevData.map((item) =>
              item.id === id ? { id, ...updatedProjectData } : item
            )
          );

          setLoading(false);
          return { success: true, message: "Project updated successfully!" };
        }
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }

    if (collec === "apples") {
      try {
        setLoading(true);

        // Find the apple to update
        const appleToUpdate = applesData.find((apple) => apple.id === id);
        if (appleToUpdate) {
          let imageUrl = appleToUpdate.imageUrl;
          let pdfUrl = appleToUpdate.pdfUrl;

          // If a new image is provided, delete the old image and upload the new one
          if (newData.image) {
            // Delete old image from Firebase Storage
            const oldImageRef = ref(storage, `apples/${appleToUpdate.imageId}`);
            await deleteObject(oldImageRef);

            // Upload new image to Firebase Storage
            const newImageRef = ref(storage, `apples/${newData.imageId}`);
            await uploadBytes(newImageRef, newData.image);
            imageUrl = await getDownloadURL(newImageRef);
          }

          // If a new pdf is provided, delete the old pdf and upload the new one
          if (newData.pdfFile) {
            // Delete old pdf from Firebase Storage
            const oldPdfRef = ref(storage, `apples/${appleToUpdate.pdfId}`);
            await deleteObject(oldPdfRef);

            // Upload new pdf to Firebase Storage
            const newPdfRef = ref(storage, `apples/${newData.pdfId}`);
            await uploadBytes(newPdfRef, newData.image);
            pdfUrl = await getDownloadURL(newPdfRef);
          }

          // Update apple data in Firestore
          const updatedAppleData = {
            title: newData.title || appleToUpdate.title,
            characteristics:
              newData.characteristics || appleToUpdate.characteristics,
            imageId: newData.imageId || appleToUpdate.imageId,
            imageUrl,
            pdfId: newData.pdfId || appleToUpdate.pdfId,
            pdfUrl,
            pdfName: newData.pdfName || appleToUpdate.pdfName,
            colour: newData.colour || appleToUpdate.colour,
            flavour: newData.flavour || appleToUpdate.flavour,
            shape: newData.shape || appleToUpdate.shape,
            skin: newData.skin || appleToUpdate.skin,
            fruitFlesh: newData.fruitFlesh || appleToUpdate.fruitFlesh,
            vigour: newData.vigour || appleToUpdate.vigour,
            blossom: newData.blossom || appleToUpdate.blossom,
            pollinator: newData.pollinator || appleToUpdate.pollinator,
            growth: newData.growth || appleToUpdate.growth,
            maturity: newData.maturity || appleToUpdate.maturity,
            size: newData.size || appleToUpdate.size,
            companyExp: newData.companyExp || appleToUpdate.companyExp,
          };

          const docRef = doc(db, "apples", id);
          await updateDoc(docRef, updatedAppleData);

          // Update local state
          setApplesData((prevData) =>
            prevData.map((item) =>
              item.id === id ? { id, ...updatedAppleData } : item
            )
          );

          setLoading(false);
          return { success: true, message: "Variety updated successfully!" };
        }
      } catch (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }
    }

    if (collec === "alert") {
      try {
        setLoading(true);

        // Find the alert to update
        const alertToUpdate = alertData.find((alert) => alert.id === id);
        if (alertToUpdate) {
          let imageUrl = alertToUpdate.imageUrl;

          // If a new image is provided, delete the old image and upload the new one
          if (newData.image) {
            // Delete old image from Firebase Storage
            const oldImageRef = ref(storage, `alert/${alertToUpdate.imageId}`);
            await deleteObject(oldImageRef);

            // Upload new image to Firebase Storage
            const newImageRef = ref(storage, `alert/${newData.imageId}`);
            await uploadBytes(newImageRef, newData.image);
            imageUrl = await getDownloadURL(newImageRef);
          }

          // Update alert data in Firestore
          const updatedAlertData = {
            title: newData.title || alertToUpdate.title,
            brief: newData.brief || alertToUpdate.brief,
            imageId: newData.imageId || alertToUpdate.imageId,
            imageUrl,
            date: newData.date || alertToUpdate.date,
            publish: newData.publish,
          };

          const docRef = doc(db, "alert", id);
          await updateDoc(docRef, updatedAlertData);

          // Update local state
          setAlertData((prevData) =>
            prevData.map((item) =>
              item.id === id ? { id, ...updatedAlertData } : item
            )
          );

          setLoading(false);
          return {
            success: true,
            message: newData.publish ? "Alert Published!" : "Alert Unpublished",
          };
        }
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
        projectsData,
        applesData,
        alertData,
        usersCount,
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
