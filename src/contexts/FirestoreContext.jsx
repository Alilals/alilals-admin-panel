"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { app } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getFirestore,
} from "firebase/firestore";

const FirestoreContext = createContext();

export const FirestoreProvider = ({ children }) => {
  const [adminsData, setAdminsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "admins"));
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdminsData(fetchedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const addData = async (newData, collec) => {
    const docRef = await addDoc(collection(db, collec), newData);
    if (collec === "admins") {
      setAdminsData((prevData) => [...prevData, { id: docRef.id, ...newData }]);
    }
  };

  const deleteData = async (id, collec) => {
    await deleteDoc(doc(db, collec, id));
    if (collec === "admins") {
      setAdminsData((prevData) => prevData.filter((item) => item.id !== id));
    }
  };

  return (
    <FirestoreContext.Provider
      value={{ adminsData, loading, addData, deleteData }}
    >
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  return useContext(FirestoreContext);
};
