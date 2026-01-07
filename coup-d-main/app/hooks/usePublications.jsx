import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import {formatDate } from "../utils/date";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth} from "firebase/auth";

export function usePublications() {
  const [data, setData] = useState([]);
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
      const currentUser = JSON.parse(await AsyncStorage.getItem("user")) || getAuth().currentUser;
      snapshot.docs.forEach((doc) => {
        const item = doc.data();
        if (item.idUser === currentUser.uid) return;
        tempItems.push({
          id: doc.id,
          ...item,
          // On prépare la date ici
          formattedDate: formatDate(item.date),
          // On prépare le titre de catégorie ici
          categoryTitle: categories[item.idCategory] || "Inconnue",
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

      // Fusion finale : on injecte la ville directement dans l'item
      const enrichedList = tempItems.map(item => ({
        ...item,
        authorCity: citiesMap[item.idUser] || ""
      }));

      setData(enrichedList);
      setLoading(false);
    });

    return unsubscribe;
  }, [categories]);

  return { data, categoriesList, loading };
}