import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { formatDate } from "../utils/date";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";

export function usePublications() {
  const [rawPublications, setRawPublications] = useState([]); 
  const [categories, setCategories] = useState({});
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Charger les catégories
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catMap = {};
      const catArray = [];
      snapshot.docs.forEach((doc) => {
        const title = doc.data().title;
        catMap[doc.id] = title;
        catArray.push({ id: doc.id, title: title });
      });
      setCategories(catMap);
      setCategoriesList(catArray);
    });
    return unsubscribe;
  }, []);

  // 2. Charger les publications et les villes
  useEffect(() => {
    const q = query(collection(db, "publications"), where("state", "==", "open"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const tempItems = [];
      const userIdsToFetch = new Set();
      
      let currentUser;
      try {
         const jsonUser = await AsyncStorage.getItem("user");
         currentUser = jsonUser ? JSON.parse(jsonUser) : getAuth().currentUser;
      } catch (e) {
         currentUser = getAuth().currentUser;
      }
      
      const currentUid = currentUser?.uid;

      snapshot.docs.forEach((doc) => {
        const item = doc.data();
        if (currentUid && item.idUser === currentUid) return;

        tempItems.push({
          id: doc.id,
          ...item,
          formattedDate: formatDate(item.date),
        });
        if (item.idUser) userIdsToFetch.add(item.idUser);
      });

      // Récupération des villes
      const citiesMap = {};
      await Promise.all(
        Array.from(userIdsToFetch).map(async (uid) => {
          try {
            const userSnap = await getDoc(doc(db, "users", uid));
            if (userSnap.exists()) {
              citiesMap[uid] = userSnap.data().city || "";
            }
          } catch (e) { console.error(e); }
        })
      );

      // Fusion finale avec les villes
      const enrichedList = tempItems.map(item => ({
        ...item,
        authorCity: citiesMap[item.idUser] || ""
      }));

      setRawPublications(enrichedList);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 3. FUSION DYNAMIQUE 
  const data = useMemo(() => {
    return rawPublications.map(item => ({
      ...item,
      categoryTitle: categories[item.idCategory] || "..." 
    }));
  }, [rawPublications, categories]);

  return { data, categoriesList, loading };
}