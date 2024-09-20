import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDZSgfVFeipUZQuzqlEnr_F29jsyc5JXXQ",
  authDomain: "test-project1-a8ea1.firebaseapp.com",
  projectId: "test-project1-a8ea1",
  storageBucket: "test-project1-a8ea1.appspot.com",
  messagingSenderId: "236476283401",
  appId: "1:236476283401:web:1a361c7442d86bbc85d6d8",
  databaseURL: "https://test-project1-a8ea1-default-rtdb.firebaseio.com",
};

export const app = initializeApp(firebaseConfig);
